import os

output_file = "code_dump.txt"
exclude_dirs = {".git", "node_modules"}  # Directories to skip entirely
exclude_files = {
    "package.json", ".gitignore", "export_to_text.py", # Exact filenames to exclude
    "package-lock.json", "README.md"
}
exclude_extensions = {".md", ".txt", ".py"}  # File extensions to exclude

with open(output_file, "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk("."):
        # Remove excluded directories from traversal
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            filepath = os.path.join(root, file)
            
            # Skip files that match exclusion criteria
            if (file in exclude_files or 
                os.path.splitext(file)[1] in exclude_extensions):
                # print(f"Skipping excluded file: {filepath}")
                continue
                
            try:
                with open(filepath, "r", encoding="utf-8") as infile:
                    outfile.write(f"\n{'=' * 40}\n{filepath}\n{'=' * 40}\n")
                    outfile.write(infile.read())
            except UnicodeDecodeError:
                print(f"Skipping binary/non-text file: {filepath}")
            except Exception as e:
                print(f"Error reading {filepath}: {str(e)}")