#!/usr/bin/env python3
"""
One-off: build a PDF chat log from the Cursor agent transcript, starting at the
user message about "Automated development specifications" (dev spec automation).

Usage:
  python3 scripts/export-dev-spec-chatlog-pdf.py \\
    [--jsonl PATH] [--out PATH]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import textwrap
from pathlib import Path

START_MARKERS = (
    "Automated development specifications (200 points)",
    "Automated development specifications",
)


def extract_text(message: dict) -> str:
    content = message.get("content")
    if not content:
        return ""
    if isinstance(content, str):
        return content
    parts: list[str] = []
    for block in content:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text") or "")
    return "\n".join(parts).strip()


def strip_user_query_wrapper(text: str) -> str:
    text = text.strip()
    m = re.match(r"<user_query>\s*(.*)\s*</user_query>\s*$", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return text


def ascii_safe(s: str) -> str:
    return s.encode("ascii", "replace").decode("ascii")


def main() -> int:
    parser = argparse.ArgumentParser()
    default_jsonl = Path.home() / (
        ".cursor/projects/Users-evelynlo-Desktop-GrocerEase/"
        "agent-transcripts/fcf6e95a-2007-411f-8bbe-dd35f2055b05/"
        "fcf6e95a-2007-411f-8bbe-dd35f2055b05.jsonl"
    )
    parser.add_argument("--jsonl", type=Path, default=default_jsonl)
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("docs/dev-specs/Dev-spec-automation-chatlog.pdf"),
    )
    args = parser.parse_args()

    if not args.jsonl.is_file():
        print(f"Transcript not found: {args.jsonl}", file=sys.stderr)
        return 1

    try:
        from fpdf import FPDF
    except ImportError:
        print("Install fpdf2: python3 -m pip install fpdf2", file=sys.stderr)
        return 1

    lines = args.jsonl.read_text(encoding="utf-8", errors="replace").splitlines()
    records: list[tuple[str, str]] = []
    started = False
    for raw in lines:
        raw = raw.strip()
        if not raw:
            continue
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            continue
        role = obj.get("role") or ""
        msg = obj.get("message") or {}
        text = strip_user_query_wrapper(extract_text(msg))
        if not text:
            continue
        if not started and role == "user":
            if any(m in text for m in START_MARKERS):
                started = True
        if not started:
            continue
        records.append((role, text))

    if not records:
        print("No transcript slice found (missing start marker).", file=sys.stderr)
        return 1

    args.out.parent.mkdir(parents=True, exist_ok=True)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(12, 12, 12)
    pdf.add_page()
    epw = pdf.epw

    def write_paragraph(
        text: str,
        line_h: float,
        *,
        font_size: int = 8,
        bold: bool = False,
    ) -> None:
        t = ascii_safe(text).replace("\t", "    ")
        style = "B" if bold else ""
        pdf.set_font("Helvetica", style, font_size)
        lines = textwrap.wrap(
            t,
            width=100,
            break_long_words=True,
            break_on_hyphens=True,
        )
        if not lines:
            pdf.ln(line_h)
            return
        for line in lines:
            pdf.multi_cell(epw, line_h, line)
        pdf.ln(1)

    title = "GrocerEase - Cursor chat log: dev spec automation"
    write_paragraph(title, 6, font_size=12, bold=True)
    meta = (
        f"Source transcript: {args.jsonl}\n"
        f"Started at first user message containing assignment text "
        f"(Automated development specifications). "
        f"Total turns exported: {len(records)}."
    )
    write_paragraph(meta, 4)
    pdf.ln(2)

    for i, (role, text) in enumerate(records, start=1):
        header = f"--- Turn {i} ({role}) ---"
        write_paragraph(header, 5, font_size=9, bold=True)
        for para in text.split("\n"):
            para = para.strip()
            if not para:
                pdf.ln(2)
                continue
            write_paragraph(para, 4)
        pdf.ln(2)

    pdf.output(str(args.out))
    print(f"Wrote {args.out} ({args.out.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
