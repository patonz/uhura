class AdapterManager:
    _adapter = None

    @classmethod
    def set_adapter(cls, adapter):
        """Set the global adapter instance."""
        cls._adapter = adapter

    @classmethod
    def get_adapter(cls):
        """Get the global adapter instance."""
        if cls._adapter is None:
            raise ValueError("Adapter not set. Please register the adapter first.")
        return cls._adapter
