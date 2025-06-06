import importlib

def test_import_visitor_counter():
    mod = importlib.import_module('VisitorCounter.__init__')
    assert hasattr(mod, 'main') 