from hermes_tools import patch

# Principles page
patches = [
    ("src/app/forum/principles/page.tsx", "The Sanctuary is a space for reflection", "Collettive is a space for reflection"),
    ("src/app/forum/principles/page.tsx", '"Back to The Sanctuary"', '"Back to Collettive"'),
    ("src/app/forum/principles/page.tsx", "The Sanctuary is not a building", "Collettive is not a building"),
    ("src/app/forum/principles/page.tsx", "Return to The Sanctuary", "Return to Collettive"),
    ("src/app/forum/profile/page.tsx", "Back to The Sanctuary", "Back to Collettive"),
    ("src/app/forum/search/page.tsx", "Trending in The Sanctuary", "Trending in Collettive"),
    ("src/app/forum/search/page.tsx", "Back to The Sanctuary", "Back to Collettive"),
    ("src/app/forum/\\[slug\\]/page.tsx", "Back to The Sanctuary", "Back to Collettive"),
    ("src/components/forum/community-pulse.tsx", "The Sanctuary is reflecting on", "Collettive is reflecting on"),
]

for f, old, new in patches:
    r = patch(path=f, old_string=old, new_string=new, mode='replace')
    status = "✓" if r.get("success") else "✗"
    print(f"{status} {f}")