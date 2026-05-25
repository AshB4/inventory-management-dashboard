from pathlib import Path

from flask_cors import CORS
from flask import Flask, jsonify, request, send_from_directory
from sqlalchemy import func, inspect, text

from models import db
from models.product import Product


BACKEND_ROOT = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = BACKEND_ROOT.parent / "frontend" / "build"
FRONTEND_STATIC_DIR = FRONTEND_BUILD_DIR / "static"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_STATIC_DIR if FRONTEND_STATIC_DIR.exists() else BACKEND_ROOT / "static"),
    static_url_path="/static",
    template_folder="templates",
)
app.url_map.strict_slashes = False
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{Path(app.root_path) / 'inventory.db'}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

ALLOWED_STATUSES = {"in_stock", "low_stock", "out_of_stock", "discontinued"}

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

db.init_app(app)


def api_response(success, message, data=None, status_code=200, errors=None):
    payload = {"success": success, "message": message}
    if data is not None:
        payload["data"] = data
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code


def ensure_product_schema():
    inspector = inspect(db.engine)
    if "products" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("products")}

    if "supplier" not in existing_columns:
        db.session.execute(
            text(
                "ALTER TABLE products ADD COLUMN supplier VARCHAR(255) NOT NULL DEFAULT 'Atlas Approved Vendor'"
            )
        )

    if "sku" not in existing_columns:
        db.session.execute(
            text(
                "ALTER TABLE products ADD COLUMN sku VARCHAR(120) NOT NULL DEFAULT ''"
            )
        )
        products = db.session.execute(db.select(Product)).scalars().all()
        for product in products:
            if not product.sku:
                product.sku = build_sku(product.name, product.id)

    db.session.commit()


def validate_product_payload(payload, partial=False):
    if not isinstance(payload, dict):
        return None, {"body": "Request body must be valid JSON."}

    errors = {}
    cleaned = {}

    required_fields = ("name", "price", "quantity", "sku")
    if not partial:
        for field in required_fields:
            if field not in payload:
                errors[field] = f"{field} is required."

    if "name" in payload:
        name = str(payload["name"]).strip() if payload["name"] is not None else ""
        if not name:
            errors["name"] = "name must be a non-empty string."
        else:
            cleaned["name"] = name

    if "category" in payload:
        category = str(payload["category"]).strip() if payload["category"] is not None else ""
        if not category:
            errors["category"] = "category must be a non-empty string."
        else:
            cleaned["category"] = category

    if "supplier" in payload:
        supplier = str(payload["supplier"]).strip() if payload["supplier"] is not None else ""
        if not supplier:
            errors["supplier"] = "supplier must be a non-empty string."
        else:
            cleaned["supplier"] = supplier

    if "sku" in payload:
        sku = str(payload["sku"]).strip().upper() if payload["sku"] is not None else ""
        if not sku:
            errors["sku"] = "sku must be a non-empty string."
        else:
            cleaned["sku"] = sku

    if "price" in payload:
        try:
            price = float(payload["price"])
            if price < 0:
                raise ValueError
            cleaned["price"] = price
        except (TypeError, ValueError):
            errors["price"] = "price must be a non-negative number."

    if "quantity" in payload:
        try:
            quantity = int(payload["quantity"])
            if quantity < 0:
                raise ValueError
            cleaned["quantity"] = quantity
        except (TypeError, ValueError):
            errors["quantity"] = "quantity must be a non-negative integer."

    if "status" in payload:
        status = str(payload["status"]).strip().lower() if payload["status"] is not None else ""
        if status not in ALLOWED_STATUSES:
            errors["status"] = (
                "status must be one of: in_stock, low_stock, out_of_stock, discontinued."
            )
        else:
            cleaned["status"] = status

    if errors:
        return None, errors

    if not partial:
        cleaned.setdefault("category", "Uncategorized")
        cleaned.setdefault("status", "in_stock")
        cleaned.setdefault("supplier", "Atlas Approved Vendor")

    return cleaned, None


def build_sku(name, product_id=None):
    normalized_name = "".join(character for character in name.upper() if character.isalnum())
    prefix = normalized_name[:6] or "ATLAS"
    suffix = f"{product_id:03d}" if product_id else "NEW"
    return f"ATL-{prefix}-{suffix}"


with app.app_context():
    db.create_all()
    ensure_product_schema()


def get_product_or_404(product_id):
    product = db.session.get(Product, product_id)
    if product is None:
        return None
    return product


@app.errorhandler(404)
def handle_not_found(error):
    if request.path.startswith("/api/"):
        return api_response(False, "Resource not found.", status_code=404)
    return error


@app.errorhandler(405)
def handle_method_not_allowed(error):
    if request.path.startswith("/api/"):
        return api_response(False, "Method not allowed.", status_code=405)
    return error


@app.errorhandler(500)
def handle_internal_error(error):
    if request.path.startswith("/api/"):
        db.session.rollback()
        return api_response(False, "Internal server error.", status_code=500)
    return error


def serve_frontend():
    if FRONTEND_BUILD_DIR.exists():
        return send_from_directory(FRONTEND_BUILD_DIR, "index.html")
    return send_from_directory(BACKEND_ROOT / "templates", "index.html")


@app.route("/")
def index():
    return serve_frontend()


@app.route("/<path:path>")
def frontend_assets(path):
    if request.path.startswith("/api/"):
        return api_response(False, "Resource not found.", status_code=404)

    frontend_target = FRONTEND_BUILD_DIR / path
    if FRONTEND_BUILD_DIR.exists() and frontend_target.exists() and frontend_target.is_file():
        return send_from_directory(FRONTEND_BUILD_DIR, path)

    return serve_frontend()


@app.route("/api/health")
def health():
    return api_response(True, "API is healthy.", {"status": "ok"})


@app.route("/api/products", methods=["GET"])
def products():
    category = request.args.get("category", "").strip().lower()
    status = request.args.get("status", "").strip().lower()
    query = Product.query

    if category:
        query = query.filter(func.lower(Product.category) == category)

    if status:
        query = query.filter(Product.status == status)

    items = query.order_by(Product.updated_at.desc()).all()
    return api_response(
        True,
        "Products retrieved.",
        [item.to_dict() for item in items],
    )


@app.route("/api/products", methods=["POST"])
def create_product():
    payload = request.get_json(silent=True)
    validated_data, errors = validate_product_payload(payload, partial=False)
    if errors:
        return api_response(False, "Validation failed.", status_code=400, errors=errors)

    product = Product(**validated_data)
    if Product.query.filter_by(sku=product.sku).first():
        return api_response(
            False,
            "Validation failed.",
            status_code=400,
            errors={"sku": "sku must be unique."},
        )
    db.session.add(product)
    db.session.commit()

    return api_response(
        True,
        "Product created.",
        product.to_dict(),
        status_code=201,
    )


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = get_product_or_404(product_id)
    if product is None:
        return api_response(False, "Product not found.", status_code=404)

    payload = request.get_json(silent=True)
    validated_data, errors = validate_product_payload(payload, partial=True)
    if errors:
        return api_response(False, "Validation failed.", status_code=400, errors=errors)
    if not validated_data:
        return api_response(
            False,
            "No valid fields provided for update.",
            status_code=400,
        )

    if "sku" in validated_data:
        existing_sku_product = Product.query.filter_by(sku=validated_data["sku"]).first()
        if existing_sku_product and existing_sku_product.id != product_id:
            return api_response(
                False,
                "Validation failed.",
                status_code=400,
                errors={"sku": "sku must be unique."},
            )

    for field, value in validated_data.items():
        setattr(product, field, value)

    db.session.commit()

    return api_response(True, "Product updated.", product.to_dict())


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = get_product_or_404(product_id)
    if product is None:
        return api_response(False, "Product not found.", status_code=404)

    db.session.delete(product)
    db.session.commit()

    return api_response(
        True,
        "Product deleted.",
        {"id": product_id},
    )


@app.route("/api/stats/total-products", methods=["GET"])
def total_products():
    total = db.session.scalar(db.select(func.count(Product.id))) or 0
    return api_response(
        True,
        "Total products retrieved.",
        {"total_products": total},
    )


@app.route("/api/stats/low-stock", methods=["GET"])
def low_stock_products():
    low_stock_count = db.session.scalar(
        db.select(func.count(Product.id)).where(Product.status == "low_stock")
    ) or 0
    return api_response(
        True,
        "Low stock count retrieved.",
        {"low_stock_products": low_stock_count},
    )


@app.route("/api/stats/inventory-value", methods=["GET"])
def inventory_value():
    total_value = db.session.scalar(
        db.select(func.sum(Product.price * Product.quantity))
    )
    normalized_value = round(float(total_value or 0), 2)
    return api_response(
        True,
        "Inventory value retrieved.",
        {"inventory_value": normalized_value},
    )


@app.route("/api/stats/out-of-stock", methods=["GET"])
def out_of_stock_products():
    out_of_stock_count = db.session.scalar(
        db.select(func.count(Product.id)).where(Product.status == "out_of_stock")
    ) or 0
    return api_response(
        True,
        "Out of stock count retrieved.",
        {"out_of_stock_products": out_of_stock_count},
    )


@app.route("/api/stats/most-expensive-product", methods=["GET"])
def most_expensive_product():
    product = Product.query.order_by(Product.price.desc(), Product.updated_at.desc()).first()
    if product is None:
        return api_response(
            True,
            "Most expensive product retrieved.",
            {"product": None},
        )

    return api_response(
        True,
        "Most expensive product retrieved.",
        {"product": product.to_dict()},
    )


if __name__ == "__main__":
    app.run(debug=True)
