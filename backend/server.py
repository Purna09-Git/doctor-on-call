from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# Note: In production, use os.environ.get('MONGO_URL') instead of hardcoding
mongo_url = "mongodb+srv://mummanipurna09_db_user:Temp123@cluster0.haoof7f.mongodb.net/?appName=Cluster0"
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'doctoroncall')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="DoctorOnCall API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ======================= MODELS =======================

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str
    pic: Optional[str] = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[str] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None
    bloodGroup: Optional[str] = None
    allergies: Optional[str] = None
    emergencyContact: Optional[str] = None

class AppointmentCreate(BaseModel):
    doctorId: str
    date: str
    time: str
    doctorname: str
    symptoms: Optional[str] = None
    appointmentType: Optional[str] = "consultation"

class ReviewCreate(BaseModel):
    doctorId: str
    rating: int
    comment: str
    appointmentId: Optional[str] = None

class PrescriptionCreate(BaseModel):
    appointmentId: str
    patientId: str
    diagnosis: str
    medications: List[dict]
    instructions: str
    followUpDate: Optional[str] = None

class MedicalRecordCreate(BaseModel):
    patientId: str
    recordType: str
    title: str
    description: str
    attachments: Optional[List[str]] = []

class SymptomCheck(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None

# ======================= HELPER FUNCTIONS =======================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str, is_admin: bool = False, is_doctor: bool = False) -> str:
    payload = {
        "userId": user_id,
        "isAdmin": is_admin,
        "isDoctor": is_doctor,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"_id": payload["userId"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ======================= USER ROUTES =======================

@api_router.post("/user/register")
async def register_user(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "_id": user_id,
        "firstname": user_data.firstname,
        "lastname": user_data.lastname,
        "email": user_data.email,
        "password": hashed_password,
        "pic": user_data.pic,
        "age": None,
        "mobile": None,
        "gender": "neither",
        "address": None,
        "bloodGroup": None,
        "allergies": None,
        "emergencyContact": None,
        "isAdmin": False,
        "isDoctor": False,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    response_doc = {k: v for k, v in user_doc.items() if k != "password"}
    return {"message": "User registered successfully", "user": response_doc}

@api_router.post("/user/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_token(user["_id"], user.get("isAdmin", False), user.get("isDoctor", False))
    return {"message": "Login successful", "token": token}

@api_router.get("/user/getuser/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    response = {k: v for k, v in user.items() if k != "password"}
    return response

@api_router.get("/user/getallusers")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    users_cursor = db.users.find({})
    users = await users_cursor.to_list(1000)
    return [{k: v for k, v in user.items() if k != "password"} for user in users]

@api_router.put("/user/updateprofile")
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if "password" in update_dict and update_dict["password"]:
        update_dict["password"] = hash_password(update_dict["password"])
    elif "password" in update_dict:
        del update_dict["password"]
    
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    if update_dict:
        await db.users.update_one({"_id": user_id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"_id": user_id})
    response = {k: v for k, v in updated_user.items() if k != "password"}
    return {"message": "Profile updated successfully", "user": response}

@api_router.delete("/user/deleteuser")
async def delete_user(data: dict, current_user: dict = Depends(get_admin_user)):
    user_id = data.get("userId")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    result = await db.users.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.doctors.delete_one({"userId": user_id})
    await db.appointments.delete_many({"$or": [{"userId": user_id}, {"doctorId": user_id}]})
    await db.notifications.delete_many({"userId": user_id})
    
    return {"message": "User deleted successfully"}

# ======================= DOCTOR ROUTES =======================

@api_router.post("/doctor/applyfordoctor")
async def apply_for_doctor(data: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    existing = await db.doctors.find_one({"userId": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Application already submitted")
    
    form_details = data.get("formDetails", data)
    
    doctor_id = str(uuid.uuid4())
    doctor_doc = {
        "_id": doctor_id,
        "userId": user_id,
        "specialization": form_details.get("specialization", ""),
        "experience": form_details.get("experience", ""),
        "fees": form_details.get("fees", ""),
        "about": form_details.get("about", ""),
        "education": form_details.get("education", ""),
        "availability": form_details.get("availability", []),
        "rating": 0,
        "totalReviews": 0,
        "totalPatients": 0,
        "isDoctor": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.doctors.insert_one(doctor_doc)
    
    admins_cursor = db.users.find({"isAdmin": True})
    admins = await admins_cursor.to_list(100)
    for admin in admins:
        notif_doc = {
            "_id": str(uuid.uuid4()),
            "userId": admin["_id"],
            "content": f"{current_user['firstname']} {current_user['lastname']} has applied to be a doctor.",
            "type": "application",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notif_doc)
    
    return {"message": "Application submitted successfully"}

@api_router.get("/doctor/getalldoctors")
async def get_all_doctors(
    specialization: Optional[str] = None,
    minRating: Optional[float] = None,
    maxFees: Optional[float] = None,
    search: Optional[str] = None
):
    query = {"isDoctor": True}
    
    if specialization:
        query["specialization"] = {"$regex": specialization, "$options": "i"}
    if minRating:
        query["rating"] = {"$gte": minRating}
    if maxFees:
        query["fees"] = {"$lte": str(maxFees)}
    
    doctors_cursor = db.doctors.find(query)
    doctors = await doctors_cursor.to_list(1000)
    
    result = []
    for doctor in doctors:
        user = await db.users.find_one({"_id": doctor["userId"]})
        if user:
            if search:
                full_name = f"{user['firstname']} {user['lastname']}".lower()
                if search.lower() not in full_name:
                    continue
            user_data = {k: v for k, v in user.items() if k != "password"}
            doctor["userId"] = user_data
            result.append(doctor)
    
    return result

@api_router.get("/doctor/getdoctor/{doctor_id}")
async def get_doctor(doctor_id: str):
    doctor = await db.doctors.find_one({"_id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    user = await db.users.find_one({"_id": doctor["userId"]})
    if user:
        doctor["userId"] = {k: v for k, v in user.items() if k != "password"}
    
    # Get reviews
    reviews_cursor = db.reviews.find({"doctorId": doctor_id}).sort("createdAt", -1).limit(10)
    reviews = await reviews_cursor.to_list(10)
    doctor["reviews"] = reviews
    
    return doctor

@api_router.get("/doctor/getnotdoctors")
async def get_not_doctors(current_user: dict = Depends(get_current_user)):
    doctors_cursor = db.doctors.find({"isDoctor": False})
    doctors = await doctors_cursor.to_list(1000)
    
    result = []
    for doctor in doctors:
        user = await db.users.find_one({"_id": doctor["userId"]})
        if user:
            user_data = {k: v for k, v in user.items() if k != "password"}
            doctor["userId"] = user_data
            result.append(doctor)
    
    return result

@api_router.put("/doctor/acceptdoctor")
async def accept_doctor(data: dict, current_user: dict = Depends(get_admin_user)):
    doctor_id = data.get("id")
    user_id = data.get("userId")
    
    if not doctor_id or not user_id:
        raise HTTPException(status_code=400, detail="Doctor ID and User ID required")
    
    await db.doctors.update_one(
        {"_id": doctor_id},
        {"$set": {"isDoctor": True, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"isDoctor": True, "status": "accepted", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    notif_doc = {
        "_id": str(uuid.uuid4()),
        "userId": user_id,
        "content": "Congratulations! Your doctor application has been accepted.",
        "type": "success",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    
    return {"message": "Doctor application accepted"}

@api_router.put("/doctor/rejectdoctor")
async def reject_doctor(data: dict, current_user: dict = Depends(get_admin_user)):
    doctor_id = data.get("id")
    user_id = data.get("userId")
    
    if not doctor_id or not user_id:
        raise HTTPException(status_code=400, detail="Doctor ID and User ID required")
    
    await db.doctors.delete_one({"_id": doctor_id})
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"status": "rejected", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    notif_doc = {
        "_id": str(uuid.uuid4()),
        "userId": user_id,
        "content": "Sorry, your doctor application has been rejected.",
        "type": "error",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    
    return {"message": "Doctor application rejected"}

@api_router.put("/doctor/deletedoctor")
async def delete_doctor(data: dict, current_user: dict = Depends(get_admin_user)):
    user_id = data.get("userId")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    await db.doctors.delete_one({"userId": user_id})
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"isDoctor": False, "status": "pending", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Doctor removed successfully"}

@api_router.put("/doctor/updateavailability")
async def update_availability(data: dict, current_user: dict = Depends(get_current_user)):
    if not current_user.get("isDoctor"):
        raise HTTPException(status_code=403, detail="Only doctors can update availability")
    
    availability = data.get("availability", [])
    
    await db.doctors.update_one(
        {"userId": current_user["_id"]},
        {"$set": {"availability": availability, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Availability updated successfully"}

# ======================= APPOINTMENT ROUTES =======================

@api_router.post("/appointment/bookappointment")
async def book_appointment(appt_data: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    appointment_id = str(uuid.uuid4())
    appointment_doc = {
        "_id": appointment_id,
        "userId": user_id,
        "doctorId": appt_data.doctorId,
        "date": appt_data.date,
        "time": appt_data.time,
        "symptoms": appt_data.symptoms,
        "appointmentType": appt_data.appointmentType,
        "status": "Pending",
        "prescription": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.appointments.insert_one(appointment_doc)
    
    # Update doctor's total patients
    await db.doctors.update_one(
        {"userId": appt_data.doctorId},
        {"$inc": {"totalPatients": 1}}
    )
    
    notif_doc = {
        "_id": str(uuid.uuid4()),
        "userId": appt_data.doctorId,
        "content": f"{current_user['firstname']} {current_user['lastname']} booked an appointment for {appt_data.date} at {appt_data.time}.",
        "type": "appointment",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    
    return {"message": "Appointment booked successfully", "appointmentId": appointment_id}

@api_router.get("/appointment/getallappointments")
async def get_all_appointments(search: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    
    if search:
        query = {"$or": [{"userId": search}, {"doctorId": search}]}
    
    appointments_cursor = db.appointments.find(query).sort("createdAt", -1)
    appointments = await appointments_cursor.to_list(1000)
    
    result = []
    for appt in appointments:
        user = await db.users.find_one({"_id": appt["userId"]})
        doctor = await db.users.find_one({"_id": appt["doctorId"]})
        
        appt["userId"] = {k: v for k, v in user.items() if k != "password"} if user else None
        appt["doctorId"] = {k: v for k, v in doctor.items() if k != "password"} if doctor else None
        result.append(appt)
    
    return result

@api_router.put("/appointment/completed")
async def complete_appointment(data: dict, current_user: dict = Depends(get_current_user)):
    appointment_id = data.get("appointid")
    
    if not appointment_id:
        raise HTTPException(status_code=400, detail="Appointment ID required")
    
    await db.appointments.update_one(
        {"_id": appointment_id},
        {"$set": {"status": "Completed", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    appointment = await db.appointments.find_one({"_id": appointment_id})
    
    if appointment:
        notif_doc = {
            "_id": str(uuid.uuid4()),
            "userId": appointment["userId"],
            "content": f"Your appointment with Dr. {current_user['firstname']} {current_user['lastname']} has been completed. Please leave a review!",
            "type": "completed",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notif_doc)
    
    return {"message": "Appointment marked as completed"}

@api_router.put("/appointment/cancel/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    appointment = await db.appointments.find_one({"_id": appointment_id})
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment["userId"] != current_user["_id"] and appointment["doctorId"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.appointments.update_one(
        {"_id": appointment_id},
        {"$set": {"status": "Cancelled", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Notify the other party
    notify_user = appointment["doctorId"] if appointment["userId"] == current_user["_id"] else appointment["userId"]
    notif_doc = {
        "_id": str(uuid.uuid4()),
        "userId": notify_user,
        "content": f"Appointment on {appointment['date']} at {appointment['time']} has been cancelled.",
        "type": "cancelled",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    
    return {"message": "Appointment cancelled successfully"}

# ======================= REVIEW ROUTES =======================

@api_router.post("/review/addreview")
async def add_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_id = str(uuid.uuid4())
    
    review_doc = {
        "_id": review_id,
        "userId": current_user["_id"],
        "userName": f"{current_user['firstname']} {current_user['lastname']}",
        "userPic": current_user.get("pic", ""),
        "doctorId": review_data.doctorId,
        "rating": review_data.rating,
        "comment": review_data.comment,
        "appointmentId": review_data.appointmentId,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    # Update doctor's rating
    reviews_cursor = db.reviews.find({"doctorId": review_data.doctorId})
    reviews = await reviews_cursor.to_list(1000)
    
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.doctors.update_one(
            {"userId": review_data.doctorId},
            {"$set": {"rating": round(avg_rating, 1), "totalReviews": len(reviews)}}
        )
    
    return {"message": "Review added successfully"}

@api_router.get("/review/getreviews/{doctor_id}")
async def get_reviews(doctor_id: str):
    reviews_cursor = db.reviews.find({"doctorId": doctor_id}).sort("createdAt", -1)
    reviews = await reviews_cursor.to_list(100)
    return reviews

# ======================= PRESCRIPTION ROUTES =======================

@api_router.post("/prescription/create")
async def create_prescription(prescription_data: PrescriptionCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get("isDoctor"):
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    
    prescription_id = str(uuid.uuid4())
    
    prescription_doc = {
        "_id": prescription_id,
        "appointmentId": prescription_data.appointmentId,
        "doctorId": current_user["_id"],
        "doctorName": f"Dr. {current_user['firstname']} {current_user['lastname']}",
        "patientId": prescription_data.patientId,
        "diagnosis": prescription_data.diagnosis,
        "medications": prescription_data.medications,
        "instructions": prescription_data.instructions,
        "followUpDate": prescription_data.followUpDate,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.prescriptions.insert_one(prescription_doc)
    
    # Update appointment with prescription
    await db.appointments.update_one(
        {"_id": prescription_data.appointmentId},
        {"$set": {"prescription": prescription_id}}
    )
    
    # Notify patient
    notif_doc = {
        "_id": str(uuid.uuid4()),
        "userId": prescription_data.patientId,
        "content": f"Dr. {current_user['firstname']} has issued a prescription for you.",
        "type": "prescription",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    
    return {"message": "Prescription created successfully", "prescriptionId": prescription_id}

@api_router.get("/prescription/getprescriptions")
async def get_prescriptions(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user.get("isDoctor"):
        query = {"doctorId": current_user["_id"]}
    else:
        query = {"patientId": current_user["_id"]}
    
    prescriptions_cursor = db.prescriptions.find(query).sort("createdAt", -1)
    prescriptions = await prescriptions_cursor.to_list(100)
    
    # Populate patient/doctor data
    for prescription in prescriptions:
        if current_user.get("isDoctor"):
            patient = await db.users.find_one({"_id": prescription["patientId"]})
            if patient:
                prescription["patient"] = {k: v for k, v in patient.items() if k != "password"}
        else:
            doctor = await db.users.find_one({"_id": prescription["doctorId"]})
            if doctor:
                prescription["doctor"] = {k: v for k, v in doctor.items() if k != "password"}
    
    return prescriptions

@api_router.get("/prescription/{prescription_id}")
async def get_prescription(prescription_id: str, current_user: dict = Depends(get_current_user)):
    prescription = await db.prescriptions.find_one({"_id": prescription_id})
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Populate data
    patient = await db.users.find_one({"_id": prescription["patientId"]})
    doctor = await db.users.find_one({"_id": prescription["doctorId"]})
    
    if patient:
        prescription["patient"] = {k: v for k, v in patient.items() if k != "password"}
    if doctor:
        prescription["doctor"] = {k: v for k, v in doctor.items() if k != "password"}
    
    return prescription

# ======================= MEDICAL RECORDS ROUTES =======================

@api_router.post("/medicalrecord/create")
async def create_medical_record(record_data: MedicalRecordCreate, current_user: dict = Depends(get_current_user)):
    record_id = str(uuid.uuid4())
    
    record_doc = {
        "_id": record_id,
        "patientId": record_data.patientId,
        "recordType": record_data.recordType,
        "title": record_data.title,
        "description": record_data.description,
        "attachments": record_data.attachments,
        "createdBy": current_user["_id"],
        "createdByName": f"{current_user['firstname']} {current_user['lastname']}",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.medicalrecords.insert_one(record_doc)
    return {"message": "Medical record created successfully", "recordId": record_id}

@api_router.get("/medicalrecord/getrecords/{patient_id}")
async def get_medical_records(patient_id: str, current_user: dict = Depends(get_current_user)):
    records_cursor = db.medicalrecords.find({"patientId": patient_id}).sort("createdAt", -1)
    records = await records_cursor.to_list(100)
    return records

# ======================= AI SYMPTOM CHECKER =======================

SYMPTOM_DATABASE = {
    "headache": {"conditions": ["Migraine", "Tension Headache", "Sinusitis", "Dehydration"], "severity": "low"},
    "fever": {"conditions": ["Flu", "Viral Infection", "COVID-19", "Bacterial Infection"], "severity": "medium"},
    "cough": {"conditions": ["Common Cold", "Bronchitis", "Asthma", "Allergies"], "severity": "low"},
    "chest pain": {"conditions": ["Angina", "Heart Attack", "Acid Reflux", "Muscle Strain"], "severity": "high"},
    "fatigue": {"conditions": ["Anemia", "Thyroid Issues", "Sleep Disorders", "Depression"], "severity": "low"},
    "shortness of breath": {"conditions": ["Asthma", "Anxiety", "Heart Failure", "Pneumonia"], "severity": "high"},
    "nausea": {"conditions": ["Food Poisoning", "Gastritis", "Pregnancy", "Motion Sickness"], "severity": "low"},
    "dizziness": {"conditions": ["Vertigo", "Low Blood Pressure", "Anemia", "Inner Ear Issues"], "severity": "medium"},
    "sore throat": {"conditions": ["Strep Throat", "Viral Infection", "Allergies", "Tonsillitis"], "severity": "low"},
    "stomach pain": {"conditions": ["Gastritis", "Appendicitis", "Food Poisoning", "IBS"], "severity": "medium"},
    "back pain": {"conditions": ["Muscle Strain", "Herniated Disc", "Arthritis", "Poor Posture"], "severity": "low"},
    "joint pain": {"conditions": ["Arthritis", "Gout", "Lupus", "Injury"], "severity": "medium"},
    "skin rash": {"conditions": ["Allergic Reaction", "Eczema", "Psoriasis", "Infection"], "severity": "low"},
    "anxiety": {"conditions": ["Anxiety Disorder", "Panic Attack", "Stress", "Thyroid Issues"], "severity": "medium"},
    "insomnia": {"conditions": ["Sleep Disorder", "Anxiety", "Depression", "Sleep Apnea"], "severity": "low"}
}

@api_router.post("/symptom/check")
async def check_symptoms(symptom_data: SymptomCheck):
    symptoms = [s.lower() for s in symptom_data.symptoms]
    
    possible_conditions = []
    severity_scores = {"low": 1, "medium": 2, "high": 3}
    max_severity = "low"
    
    for symptom in symptoms:
        for key, value in SYMPTOM_DATABASE.items():
            if key in symptom or symptom in key:
                for condition in value["conditions"]:
                    if condition not in possible_conditions:
                        possible_conditions.append(condition)
                if severity_scores[value["severity"]] > severity_scores[max_severity]:
                    max_severity = value["severity"]
    
    # Generate recommendations
    recommendations = []
    if max_severity == "high":
        recommendations = [
            "Seek immediate medical attention",
            "Visit the nearest emergency room",
            "Call emergency services if symptoms worsen"
        ]
    elif max_severity == "medium":
        recommendations = [
            "Schedule an appointment with a doctor soon",
            "Monitor your symptoms closely",
            "Stay hydrated and rest"
        ]
    else:
        recommendations = [
            "Rest and monitor your symptoms",
            "Stay hydrated",
            "Consider over-the-counter remedies",
            "Consult a doctor if symptoms persist"
        ]
    
    # Suggest specializations
    specializations = []
    if any(s in symptoms for s in ["chest pain", "shortness of breath"]):
        specializations.append("Cardiologist")
    if any(s in symptoms for s in ["headache", "dizziness"]):
        specializations.append("Neurologist")
    if any(s in symptoms for s in ["stomach pain", "nausea"]):
        specializations.append("Gastroenterologist")
    if any(s in symptoms for s in ["skin rash"]):
        specializations.append("Dermatologist")
    if any(s in symptoms for s in ["anxiety", "insomnia"]):
        specializations.append("Psychiatrist")
    if not specializations:
        specializations.append("General Physician")
    
    return {
        "symptoms": symptom_data.symptoms,
        "possibleConditions": possible_conditions[:5] if possible_conditions else ["General Health Concern"],
        "severity": max_severity,
        "recommendations": recommendations,
        "suggestedSpecializations": specializations,
        "disclaimer": "This is an AI-powered preliminary assessment. Please consult a healthcare professional for accurate diagnosis."
    }

# ======================= ANALYTICS ROUTES =======================

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    # Total counts
    total_users = await db.users.count_documents({})
    total_doctors = await db.doctors.count_documents({"isDoctor": True})
    total_appointments = await db.appointments.count_documents({})
    pending_applications = await db.doctors.count_documents({"isDoctor": False})
    
    # Appointment stats
    completed_appointments = await db.appointments.count_documents({"status": "Completed"})
    pending_appointments = await db.appointments.count_documents({"status": "Pending"})
    cancelled_appointments = await db.appointments.count_documents({"status": "Cancelled"})
    
    # Monthly appointments (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        # Calculate date range for the month
        current_date = datetime.now(timezone.utc)
        start_date = current_date - timedelta(days=(i + 1) * 30)
        end_date = current_date - timedelta(days=i * 30)
        
        # Format month name (e.g., "Jan", "Feb")
        month_name = end_date.strftime("%b")
        
        # Count appointments in this range
        count = await db.appointments.count_documents({
            "createdAt": {
                "$gte": start_date.isoformat(),
                "$lt": end_date.isoformat()
            }
        })
        
        monthly_data.append({
            "name": month_name,
            "appointments": count
        })
    
    return {
        "totalUsers": total_users,
        "totalDoctors": total_doctors,
        "totalAppointments": total_appointments,
        "pendingApplications": pending_applications,
        "appointmentStats": {
            "completed": completed_appointments,
            "pending": pending_appointments,
            "cancelled": cancelled_appointments
        },
        "monthlyData": monthly_data
    }

# ======================= NOTIFICATION ROUTES =======================

@api_router.get("/notification/getallnotifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Fetch all notifications for the logged-in user.
    """
    notifications_cursor = db.notifications.find({"userId": current_user["_id"]}).sort("createdAt", -1)
    notifications = await notifications_cursor.to_list(100)
    
    # mark as read functionality could be added here or via a separate endpoint
    
    return notifications

@api_router.delete("/notification/deleteall")
async def delete_all_notifications(current_user: dict = Depends(get_current_user)):
    """
    Clear all notifications for the user
    """
    await db.notifications.delete_many({"userId": current_user["_id"]})
    return {"message": "All notifications cleared"}

# ======================= APP CONFIGURATION =======================

# Include the router in the main app
app.include_router(api_router)

# Add CORS Middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to DoctorOnCall API", "version": "2.0.0", "status": "Running"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)