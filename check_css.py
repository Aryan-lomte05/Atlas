import urllib.request
import re

try:
    html = urllib.request.urlopen("http://localhost:3000").read().decode("utf-8")
    print("HTML length:", len(html))
    css_files = re.findall(r'href="([^"]+\.css[^"]*)"', html)
    print("Found CSS files:", css_files)
    for c in css_files:
        url = c if c.startswith("http") else "http://localhost:3000" + c
        try:
            content = urllib.request.urlopen(url).read().decode("utf-8")
            print(f"File: {c}, Length: {len(content)}")
            print("Contains .max-w-7xl:", ".max-w-7xl" in content or "max-w-7xl" in content)
            print("Contains .mx-auto:", ".mx-auto" in content or "mx-auto" in content)
            print("Contains .flex:", ".flex" in content)
            print("Contains .grid:", ".grid" in content)
        except Exception as e:
            print("Error fetching CSS:", e)
except Exception as e:
    print("Error:", e)
