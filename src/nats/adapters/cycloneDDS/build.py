import os
import subprocess
import sys
import re

def compile_protos(proto_root='../../../common/protos', output_dir='../../nats/adapters/cycloneDDS/src/proto'):
    """Compiles all .proto files using OS-agnostic paths."""

    # Normalize paths to ensure compatibility
    proto_root = os.path.normpath(proto_root)
    output_dir = os.path.normpath(output_dir)

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Change to the proto root directory to match manual compilation behavior
    os.chdir(proto_root)

    # Find all .proto files and compile them
    for root, _, files in os.walk("."):
        for file in files:
            if file.endswith('.proto'):
                proto_file = os.path.join(root, file)
                print(f"Compiling {proto_file}...")

                try:
                    subprocess.run(
                        [
                            'protoc',
                            f'--proto_path=.',
                            f'--python_out={os.path.abspath(output_dir)}',
                            proto_file,
                        ],
                        check=True,
                    )
                except subprocess.CalledProcessError as e:
                    print(f"Error compiling {proto_file}: {e}", file=sys.stderr)
                    sys.exit(1)

    print(f"Compilation complete. Files are in {os.path.abspath(output_dir)}")
    print("Fixing imports...")
    fix_protobuf_imports(output_dir)


def fix_protobuf_imports(directory):
    """Fix imports in generated Protobuf files to use relative imports."""
    # Regex pattern to match 'import X_pb2 as X__pb2'
    pattern = re.compile(r"^import (\w+_pb2) as (\w+__pb2)", re.MULTILINE)

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith("_pb2.py"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()

                # Replace with 'from . import X_pb2 as X__pb2'
                new_content = pattern.sub(r"from . import \1 as \2", content)

                with open(file_path, 'w') as f:
                    f.write(new_content)

    print(f"Fixed imports in Protobuf files under {directory}")
if __name__ == "__main__":
    compile_protos()
