from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
PDF_DIR = ROOT_DIR / "pdf продуктов"
TMP_DIR = ROOT_DIR / "tmp"
OUTPUT_PATH = ROOT_DIR / "backend" / "src" / "data" / "nutrition-products.json"

CATALOG_TWO_PATH = PDF_DIR / "tabliza_kaloriinosti2.pdf"
CATALOG_ONE_PATH = PDF_DIR / "tablica_kaloriinisti1.pdf"

CATALOG_TWO_HEADINGS = {
    "Хлебобулочные изделия, мука, крупы, бобовые": "food",
    "Молочные продукты": "food",
    "Мясные продукты, птица": "food",
    "Колбасные изделия, мясные консервы": "food",
    "Рыба и морепродукты": "food",
    "Яйцепродукты": "food",
    "Масла, жиры и жировые продукты": "food",
    "Овощи, картофель, зелень, грибы, овощные консервы": "food",
    "Фрукты, ягоды, бахчевые": "food",
    "Орехи, семена, сухофрукты": "food",
    "Сахар, сладкое и кондитерские изделия": "food",
    "Соки, напитки безалкогольные": "drink",
    "Напитки алкогольные": "drink",
}

CATALOG_ONE_HEADINGS = {
    "Овощи, зелень, грибы": "food",
    "Сушеные овощи": "food",
    "Квашеные, соленые овощи": "food",
    "Фрукты": "food",
    "Фрукты сушеные": "food",
    "Рыба, морепродукты": "food",
    "Рыба горячего копченья": "food",
    "Икра": "food",
    "Мясо": "food",
    "Мясные продукты": "food",
    "Птица": "food",
    "Субпродукты": "food",
    "Молочные продукты": "food",
    "Сыры": "food",
    "Масла и жиры": "food",
    "Хлеб, мучные продукты": "food",
    "Крупы, орехи": "food",
    "Шоколад, конфеты, сахар": "food",
    "Алкогольные напитки": "drink",
    "Соки": "drink",
}

IGNORED_LINES = {
    "Продукты",
    "Продукт",
    "Источники:",
    "Ккал",
    "Ккал на 100 мл",
    "Калорийность некоторых готовых блюд",
}

IGNORED_PREFIXES = (
    "Таблица калорийности",
    "Категории продуктов",
    "Белки",
    "Жиры",
    "Углеводы",
    "Энергия",
    "в 100 граммах",
    "продуктов учитывается",
    "рациона питания",
    "Информация о калорийности",
    "Составитель:",
    "Вы Хотите Понять:",
    "дня не давали",
    "невероятными усилиями",
    "возвращались",
    "меньший результат",
    "на сайте",
    "эти вопросы",
    "Перейти на сайт",
    "Приведенная в таблице",
    "изменяться в большую",
    "Это связано с тем",
    "Если вы стремитесь",
    "Наиболее точную информацию",
    "Данные USDA",
    "Б. Л. Смолянский",
)

IGNORED_EXACT_LINES = {
    "г",
    "ккал",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
}

SUBHEADINGS = {
    "Рыба соленая, копченая, вяленая, икра",
    "Консервы рыбные",
    "Грибы",
    "Овощные консервы",
}

RAW_LINE_FIXES = {
    '"Actimel" разных видов 2,7-2,9 15-1,6 10,5-12 71-75': '"Actimel" разных видов 2,7-2,9 1,5-1,6 10,5-12 71-75',
}

FOOD_SECTIONS = ["breakfast", "lunch", "dinner", "snacks"]
DRINK_SECTIONS = ["drinks"]
WATER_SECTIONS = ["water"]

FULL_ROW_RE = re.compile(
    r"^(?P<name>.+?)\s+"
    r"(?P<protein>[-–—0-9.,]+)\s+"
    r"(?P<fat>[-–—0-9.,]+)\s+"
    r"(?P<carbs>[-–—0-9.,]+)\s+"
    r"(?P<calories>[-–—0-9.,]+)$"
)

NUMBERS_ONLY_RE = re.compile(
    r"^(?P<protein>[-–—0-9.,]+)\s+"
    r"(?P<fat>[-–—0-9.,]+)\s+"
    r"(?P<carbs>[-–—0-9.,]+)\s+"
    r"(?P<calories>[-–—0-9.,]+)$"
)


def normalize_text(value: str) -> str:
    value = value.replace("\f", " ")
    value = value.replace("шлифованныйвареный", "шлифованный вареный")
    value = value.replace("в/с,вареные", "в/с, вареные")
    value = value.replace(" .", ".")
    value = re.sub(r"\s+", " ", value)
    return value.strip(" -\t")


def normalize_name_key(value: str) -> str:
    value = normalize_text(value).lower().replace("ё", "е")
    value = re.sub(r"[^a-zа-я0-9%]+", " ", value)
    return value.strip()


def parse_number(value: str) -> float | None:
    normalized_value = value.replace(" ", "").replace(",", ".")

    if normalized_value in {"", "-", "–", "—"}:
        return None

    parts = [part for part in re.split(r"[-–—]", normalized_value) if part]

    try:
        values = [float(part) for part in parts]
    except ValueError:
        return None

    return round(sum(values) / len(values), 1)


def get_product_type(name: str, source_kind: str) -> tuple[str, str, list[str]]:
    normalized_name = normalize_name_key(name)

    if source_kind == "drink":
        water_markers = ("вода", "water")

        if any(marker in normalized_name for marker in water_markers):
            return "water", "мл", WATER_SECTIONS

        return "drink", "мл", DRINK_SECTIONS

    return "food", "г", FOOD_SECTIONS


def should_skip_line(value: str) -> bool:
    if not value:
        return True

    if value in IGNORED_LINES or value in IGNORED_EXACT_LINES or value in SUBHEADINGS:
        return True

    if value.startswith("Продукт Белки") or value.startswith("Продукты Белки"):
        return True

    return any(value.startswith(prefix) for prefix in IGNORED_PREFIXES)


def get_short_name_prefix(name: str) -> str:
    if '"' in name:
        return normalize_text(name.split('"')[0])

    simple_prefixes = ("Сосиски", "Сардельки")

    for prefix in simple_prefixes:
        if name.startswith(prefix):
            return prefix

    return ""


def extract_products(lines: list[str], headings: dict[str, str], source_name: str) -> list[dict]:
    products = []
    current_heading = ""
    pending_name_parts: list[str] = []
    short_name_prefix = ""

    for raw_line in lines:
        line = normalize_text(RAW_LINE_FIXES.get(raw_line, raw_line))

        if should_skip_line(line):
            continue

        if line in headings:
            current_heading = line
            pending_name_parts = []
            short_name_prefix = ""
            continue

        if not current_heading:
            continue

        if line.startswith(">>"):
            if not short_name_prefix:
                continue

            line = normalize_text(f"{short_name_prefix} {line.removeprefix('>>').strip()}")

        numbers_only_match = NUMBERS_ONLY_RE.match(line)

        if numbers_only_match and pending_name_parts:
            name = normalize_text(" ".join(pending_name_parts))
            pending_name_parts = []
            product = build_product(name, numbers_only_match.groupdict(), headings[current_heading], source_name)

            if product:
                products.append(product)
                short_name_prefix = get_short_name_prefix(product["name"])

            continue

        row_match = FULL_ROW_RE.match(line)

        if row_match:
            product = build_product(
                normalize_text(row_match.group("name")),
                row_match.groupdict(),
                headings[current_heading],
                source_name,
            )

            if product:
                products.append(product)
                short_name_prefix = get_short_name_prefix(product["name"])

            pending_name_parts = []
            continue

        pending_name_parts.append(line)

    return products


def build_product(name: str, values: dict[str, str], source_kind: str, source_name: str) -> dict | None:
    protein = parse_number(values["protein"])
    fat = parse_number(values["fat"])
    carbs = parse_number(values["carbs"])
    calories = parse_number(values["calories"])

    if None in {protein, fat, carbs, calories}:
        return None

    product_kind, unit_label, allowed_sections = get_product_type(name, source_kind)

    return {
        "name": name,
        "name_normalized": normalize_name_key(name),
        "product_kind": product_kind,
        "unit_label": unit_label,
        "base_amount": 100,
        "calories": calories,
        "protein": protein,
        "fat": fat,
        "carbs": carbs,
        "allowed_sections": allowed_sections,
        "source_label": source_name,
    }


def read_pdf_as_text(pdf_path: Path, output_path: Path) -> list[str]:
    result = subprocess.run(
        ["pdftotext", "-raw", str(pdf_path), str(output_path)],
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(f"Не удалось извлечь текст из {pdf_path}")

    return output_path.read_text().splitlines()


def build_catalog() -> list[dict]:
    TMP_DIR.mkdir(exist_ok=True)

    catalog_two_lines = read_pdf_as_text(CATALOG_TWO_PATH, TMP_DIR / "catalog2-raw.txt")
    catalog_one_lines = read_pdf_as_text(CATALOG_ONE_PATH, TMP_DIR / "catalog1-raw.txt")

    catalog_two_products = extract_products(catalog_two_lines, CATALOG_TWO_HEADINGS, "tabliza_kaloriinosti2.pdf")
    catalog_one_products = extract_products(catalog_one_lines, CATALOG_ONE_HEADINGS, "tablica_kaloriinisti1.pdf")

    merged_products: dict[str, dict] = {}

    for product in [*catalog_two_products, *catalog_one_products]:
        if product["name_normalized"] in merged_products:
            continue

        merged_products[product["name_normalized"]] = product

    return sorted(merged_products.values(), key=lambda item: item["name"])


def main() -> None:
    catalog = build_catalog()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"Готово: {len(catalog)} продуктов записано в {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
