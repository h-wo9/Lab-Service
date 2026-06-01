from pydantic import BaseModel
from datetime import date, datetime


# --- 유저 & 인증 ---

class UserCreate(BaseModel):
    student_id: str
    password: str
    name: str

class UserResponse(BaseModel):
    student_id: str
    name: str
    lab_id: int | None = None
    role: str | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- 랩실 ---

class LabCreate(BaseModel):
    name: str
    field: str
    description: str
    leader_id: str = ""  # 서버에서 토큰으로 덮어쓰므로 기본값 허용

class LabResponse(BaseModel):
    lab_id: int
    name: str
    field: str
    leader_id: str

    class Config:
        from_attributes = True

class UserInLab(BaseModel):
    student_id: str
    name: str
    role: str

    class Config:
        from_attributes = True

class LabWithMembersResponse(BaseModel):
    lab_id: int
    name: str
    field: str
    description: str | None = None
    leader_id: str
    members: list[UserInLab]

    class Config:
        from_attributes = True

class MemberAdd(BaseModel):
    leader_id: str
    student_id: str


# --- 일정 ---

class ScheduleCreate(BaseModel):
    title: str
    date: str

class ScheduleResponse(BaseModel):
    schedule_id: int
    lab_id: int
    title: str
    date: str

    class Config:
        from_attributes = True


# --- 장부 ---

class FinanceBase(BaseModel):
    type: str
    amount: int
    description: str | None = None
    record_date: date

class FinanceCreate(FinanceBase):
    pass

class Finance(FinanceBase):
    finance_id: int
    lab_id: int

    class Config:
        from_attributes = True


# --- 회비 청구 ---

class FeeBase(BaseModel):
    title: str
    amount: int

class FeeCreate(FeeBase):
    pass

class Fee(FeeBase):
    fee_id: int
    lab_id: int

    class Config:
        from_attributes = True

class FeePaymentInfo(BaseModel):
    payment_id: int
    fee_id: int
    student_id: str
    is_paid: bool

    class Config:
        from_attributes = True


# --- 가입 신청 ---

class ApplicationBase(BaseModel):
    student_id: str
    content: str

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdateStatus(BaseModel):
    status: str  # "approved" or "rejected"

class Application(ApplicationBase):
    app_id: int
    lab_id: int
    status: str
    applied_at: datetime | None = None

    class Config:
        from_attributes = True
