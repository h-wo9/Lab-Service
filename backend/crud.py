from jose import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "my_super_secret_lab_key_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# --- 유저 & 인증 ---

def get_user_by_student_id(db: Session, student_id: str):
    return db.query(models.User).filter(models.User.student_id == student_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        student_id=user.student_id,
        password=hashed_password,
        name=user.name,
        role="student"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, student_id: str, password: str):
    user = get_user_by_student_id(db, student_id)
    if not user:
        return False
    if not pwd_context.verify(password, user.password):
        return False
    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# --- 랩실 ---

def create_lab(db: Session, lab: schemas.LabCreate):
    db_lab = models.Lab(
        name=lab.name,
        field=lab.field,
        description=lab.description,
        leader_id=lab.leader_id
    )
    db.add(db_lab)
    db.commit()
    db.refresh(db_lab)

    user = get_user_by_student_id(db, lab.leader_id)
    if user:
        user.role = "leader"
        user.lab_id = db_lab.lab_id
        db.commit()
        db.refresh(user)

    return db_lab

def add_lab_member(db: Session, leader_id: str, student_id: str):
    leader = get_user_by_student_id(db, leader_id)
    if not leader or leader.role != "leader" or leader.lab_id is None:
        return "NOT_LEADER"

    student = get_user_by_student_id(db, student_id)
    if not student:
        return "NOT_FOUND"

    if student.lab_id is not None:
        return "ALREADY_IN_LAB"

    student.lab_id = leader.lab_id
    db.commit()
    db.refresh(student)
    return student

def get_all_labs(db: Session):
    return db.query(models.Lab).all()


# --- 일정 ---

def create_schedule(db: Session, lab_id: int, sched: schemas.ScheduleCreate):
    db_sched = models.Schedule(lab_id=lab_id, title=sched.title, date=sched.date)
    db.add(db_sched)
    db.commit()
    db.refresh(db_sched)
    return db_sched

def get_schedules(db: Session, lab_id: int):
    return db.query(models.Schedule).filter(models.Schedule.lab_id == lab_id).all()

def update_schedule(db: Session, schedule_id: int, sched: schemas.ScheduleCreate):
    db_sched = db.query(models.Schedule).filter(models.Schedule.schedule_id == schedule_id).first()
    if db_sched:
        db_sched.title = sched.title
        db_sched.date  = sched.date
        db.commit()
        db.refresh(db_sched)
    return db_sched

def delete_schedule(db: Session, schedule_id: int):
    db_sched = db.query(models.Schedule).filter(models.Schedule.schedule_id == schedule_id).first()
    if db_sched:
        db.delete(db_sched)
        db.commit()
    return db_sched


# --- 장부 ---

def create_finance_record(db: Session, lab_id: int, finance: schemas.FinanceCreate):
    db_finance = models.Finance(
        lab_id=lab_id,
        type=finance.type,
        amount=finance.amount,
        description=finance.description,
        record_date=finance.record_date
    )
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance

def get_finances_by_lab(db: Session, lab_id: int):
    return (
        db.query(models.Finance)
        .filter(models.Finance.lab_id == lab_id)
        .order_by(models.Finance.record_date.desc())
        .all()
    )


# --- 회비 ---

def create_fee_for_lab(db: Session, lab_id: int, fee: schemas.FeeCreate):
    db_fee = models.Fee(lab_id=lab_id, title=fee.title, amount=fee.amount)
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)

    lab_members = db.query(models.User).filter(models.User.lab_id == lab_id).all()
    for member in lab_members:
        db_payment = models.FeePayment(
            fee_id=db_fee.fee_id,
            student_id=member.student_id,
            is_paid=False
        )
        db.add(db_payment)

    db.commit()
    return db_fee

def get_fees_by_lab(db: Session, lab_id: int):
    return db.query(models.Fee).filter(models.Fee.lab_id == lab_id).all()

def pay_fee(db: Session, fee_id: int, student_id: str):
    payment = db.query(models.FeePayment).filter(
        models.FeePayment.fee_id == fee_id,
        models.FeePayment.student_id == student_id
    ).first()
    if payment:
        payment.is_paid = True
        db.commit()
    return payment

def get_fee_payments(db: Session, fee_id: int):
    return db.query(models.FeePayment).filter(models.FeePayment.fee_id == fee_id).all()


# --- 가입 신청 ---

def create_application(db: Session, lab_id: int, application: schemas.ApplicationCreate):
    db_app = models.Application(
        lab_id=lab_id,
        student_id=application.student_id,
        content=application.content
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_applications_by_lab(db: Session, lab_id: int):
    return db.query(models.Application).filter(models.Application.lab_id == lab_id).all()

def update_application_status(db: Session, app_id: int, status: str):
    db_app = db.query(models.Application).filter(models.Application.app_id == app_id).first()
    if db_app:
        db_app.status = status
        if status == "approved":
            student = db.query(models.User).filter(models.User.student_id == db_app.student_id).first()
            if student:
                student.lab_id = db_app.lab_id
        db.commit()
        db.refresh(db_app)
    return db_app


# --- 통계 분석 (Statistics) ---

def get_lab_stats(db: Session, lab_id: int):
    # 1. 수입/지출 타입별 합계 및 건수 (GROUP BY + SUM + COUNT)
    type_totals = (
        db.query(
            models.Finance.type,
            func.sum(models.Finance.amount).label('total'),
            func.count(models.Finance.finance_id).label('count')
        )
        .filter(models.Finance.lab_id == lab_id)
        .group_by(models.Finance.type)
        .all()
    )
    income_total  = next((int(r.total) for r in type_totals if r.type == 'income'),  0)
    expense_total = next((int(r.total) for r in type_totals if r.type == 'expense'), 0)
    tx_count      = sum(r.count for r in type_totals)

    # 2. 월별 수입/지출 추이 (GROUP BY month, type + SUM)
    monthly_raw = (
        db.query(
            func.date_format(models.Finance.record_date, '%Y-%m').label('month'),
            models.Finance.type,
            func.sum(models.Finance.amount).label('total')
        )
        .filter(models.Finance.lab_id == lab_id)
        .group_by(
            func.date_format(models.Finance.record_date, '%Y-%m'),
            models.Finance.type
        )
        .order_by(func.date_format(models.Finance.record_date, '%Y-%m'))
        .all()
    )
    monthly_dict = {}
    for row in monthly_raw:
        if row.month not in monthly_dict:
            monthly_dict[row.month] = {'month': row.month, 'income': 0, 'expense': 0}
        monthly_dict[row.month][row.type] = int(row.total)

    # 3. 랩원 수 (COUNT)
    member_count = (
        db.query(func.count(models.User.student_id))
        .filter(models.User.lab_id == lab_id)
        .scalar() or 0
    )

    # 4. 일정 수 (COUNT)
    schedule_count = (
        db.query(func.count(models.Schedule.schedule_id))
        .filter(models.Schedule.lab_id == lab_id)
        .scalar() or 0
    )

    # 5. 회비 납부 현황 (JOIN + GROUP BY + COUNT)
    fee_payment_stats = (
        db.query(
            models.FeePayment.is_paid,
            func.count(models.FeePayment.payment_id).label('count')
        )
        .join(models.Fee, models.FeePayment.fee_id == models.Fee.fee_id)
        .filter(models.Fee.lab_id == lab_id)
        .group_by(models.FeePayment.is_paid)
        .all()
    )
    fee_paid   = next((r.count for r in fee_payment_stats if r.is_paid),      0)
    fee_unpaid = next((r.count for r in fee_payment_stats if not r.is_paid),  0)
    fee_total  = fee_paid + fee_unpaid

    return {
        'summary': {
            'total_income':       income_total,
            'total_expense':      expense_total,
            'balance':            income_total - expense_total,
            'total_transactions': tx_count,
            'total_members':      member_count,
            'total_schedules':    schedule_count,
        },
        'monthly_finance': sorted(monthly_dict.values(), key=lambda x: x['month']),
        'fee_stats': {
            'total':  fee_total,
            'paid':   fee_paid,
            'unpaid': fee_unpaid,
            'rate':   round(fee_paid / fee_total * 100, 1) if fee_total > 0 else 0,
        },
    }
