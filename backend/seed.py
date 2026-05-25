from app import app
from models import db
from models.product import Product


PRODUCTS = [
    {
        "name": "Atlas Servo Motor X200",
        "category": "Actuators",
        "price": 149.99,
        "quantity": 12,
        "status": "in_stock",
        "supplier": "RoboMotion Inc",
        "sku": "ATL-SRV-200",
    },
    {
        "name": "Titan Hydraulic Arm Kit",
        "category": "Automation",
        "price": 899.00,
        "quantity": 3,
        "status": "low_stock",
        "supplier": "Titan Industrial Systems",
        "sku": "TIT-HYD-ARM",
    },
    {
        "name": "NovaVision AI Camera",
        "category": "Vision Systems",
        "price": 649.50,
        "quantity": 8,
        "status": "in_stock",
        "supplier": "NovaTech Automation",
        "sku": "NOV-AIC-649",
    },
    {
        "name": "Precision Torque Sensor",
        "category": "Sensors",
        "price": 119.95,
        "quantity": 15,
        "status": "in_stock",
        "supplier": "Fusion Dynamics",
        "sku": "SEN-TRQ-119",
    },
    {
        "name": "HyperDrive Motor Controller",
        "category": "Controllers",
        "price": 299.99,
        "quantity": 6,
        "status": "low_stock",
        "supplier": "OmniCore Manufacturing",
        "sku": "CTL-HYP-300",
    },
    {
        "name": "Quantum Relay Module",
        "category": "Controllers",
        "price": 84.75,
        "quantity": 24,
        "status": "in_stock",
        "supplier": "NovaTech Automation",
        "sku": "CTL-QRM-084",
    },
    {
        "name": "Atlas Li-Ion Power Cell",
        "category": "Power Systems",
        "price": 179.99,
        "quantity": 10,
        "status": "in_stock",
        "supplier": "EdgeLink Robotics",
        "sku": "PWR-LION-180",
    },
    {
        "name": "Industrial Safety Light Curtain",
        "category": "Safety Equipment",
        "price": 540.00,
        "quantity": 2,
        "status": "low_stock",
        "supplier": "OmniCore Manufacturing",
        "sku": "SAFE-LGT-540",
    },
    {
        "name": "Smart Conveyor Actuator",
        "category": "Automation",
        "price": 1250.00,
        "quantity": 1,
        "status": "low_stock",
        "supplier": "Titan Industrial Systems",
        "sku": "AUT-CON-125",
    },
    {
        "name": "RoboGrip End Effector",
        "category": "Actuators",
        "price": 420.00,
        "quantity": 0,
        "status": "out_of_stock",
        "supplier": "RoboMotion Inc",
        "sku": "ACT-RGE-420",
    },
    {
        "name": "EdgeLink Industrial Router",
        "category": "Networking",
        "price": 210.49,
        "quantity": 13,
        "status": "in_stock",
        "supplier": "EdgeLink Robotics",
        "sku": "NET-EDG-210",
    },
    {
        "name": "VisionTrack Depth Sensor",
        "category": "Sensors",
        "price": 389.99,
        "quantity": 7,
        "status": "in_stock",
        "supplier": "NovaTech Automation",
        "sku": "SEN-VTD-390",
    },
    {
        "name": "Atlas Diagnostic Tablet",
        "category": "Accessories",
        "price": 799.99,
        "quantity": 4,
        "status": "low_stock",
        "supplier": "Fusion Dynamics",
        "sku": "ACC-DTAB-800",
    },
    {
        "name": "OmniFlex Pneumatic Valve",
        "category": "Automation",
        "price": 129.99,
        "quantity": 18,
        "status": "in_stock",
        "supplier": "OmniCore Manufacturing",
        "sku": "AUT-OMN-130",
    },
    {
        "name": "Fusion Robotics Toolkit",
        "category": "Industrial Tools",
        "price": 999.00,
        "quantity": 5,
        "status": "low_stock",
        "supplier": "Fusion Dynamics",
        "sku": "TOOL-FRT-999",
    },
    {
        "name": "MicroPulse Encoder Kit",
        "category": "Sensors",
        "price": 74.99,
        "quantity": 20,
        "status": "in_stock",
        "supplier": "RoboMotion Inc",
        "sku": "SEN-MPE-075",
    },
    {
        "name": "Thermal Monitoring Module",
        "category": "Safety Equipment",
        "price": 260.00,
        "quantity": 9,
        "status": "in_stock",
        "supplier": "EdgeLink Robotics",
        "sku": "SAFE-TMM-260",
    },
    {
        "name": "Adaptive Servo Controller",
        "category": "Controllers",
        "price": 455.00,
        "quantity": 2,
        "status": "low_stock",
        "supplier": "RoboMotion Inc",
        "sku": "CTL-ASC-455",
    },
    {
        "name": "Atlas Backup Power Unit",
        "category": "Power Systems",
        "price": 1450.00,
        "quantity": 1,
        "status": "low_stock",
        "supplier": "Titan Industrial Systems",
        "sku": "PWR-BKP-145",
    },
    {
        "name": "NeuralPath Automation Hub",
        "category": "Networking",
        "price": 2199.99,
        "quantity": 0,
        "status": "out_of_stock",
        "supplier": "NovaTech Automation",
        "sku": "NET-NPA-220",
    },
]


def seed_products():
    with app.app_context():
        db.drop_all()
        db.create_all()

        for product_data in PRODUCTS:
            db.session.add(Product(**product_data))

        db.session.commit()
        print(f"Seeded {len(PRODUCTS)} products into backend/inventory.db")


if __name__ == "__main__":
    seed_products()
