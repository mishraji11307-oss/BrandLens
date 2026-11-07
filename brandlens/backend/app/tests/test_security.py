from app.core.security import verify_password, get_password_hash, create_access_token, decode_token

def test_password_hashing():
    pwd = "SuperSecurePassword123!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_flow():
    token = create_access_token(subject="user-123", role="CREATOR", org_id="org-456")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["role"] == "CREATOR"
    assert payload["org_id"] == "org-456"

