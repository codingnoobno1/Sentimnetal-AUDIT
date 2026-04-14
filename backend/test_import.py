try:
    from main import app
    print("Import success")
except Exception as e:
    import traceback
    traceback.print_exc()
