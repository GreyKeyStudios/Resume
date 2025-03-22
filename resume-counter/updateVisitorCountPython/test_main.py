import pytest
from updateVisitorCountPython.main import main as main_function

def test_response_message():
    class MockRequest:
        def __init__(self):
            self.method = "GET"

    mock_req = MockRequest()
    result = main_function(mock_req)  # ✅ FIXED: direct call

    assert result.status_code == 200
    assert "Python function is live!" in result.get_body().decode()
