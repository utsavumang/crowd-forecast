import pandas as pd


def get_indian_holidays() -> pd.DataFrame:
    rows = []

    fixed = [
        ("Republic Day", 1, 26, 4, 2),
        ("Independence Day", 8, 15, 2, 2),
        ("Gandhi Jayanti", 10, 2, 1, 1),
        ("Christmas", 12, 25, 3, 3),
    ]

    for year in range(2019, 2028):
        for name, month, day, lower, upper in fixed:
            rows.append({
                "holiday": name,
                "ds": pd.Timestamp(year=year, month=month, day=day),
                "lower_window": -lower,
                "upper_window": upper,
            })

    variable = [
        ("Holi",                "2026-03-03", 3, 3),
        ("Holi",                "2027-03-22", 3, 3),

        ("Diwali",              "2026-11-08", 5, 5),
        ("Diwali",              "2027-10-29", 5, 5),

        ("Dussehra",            "2026-10-20", 3, 3),
        ("Dussehra",            "2027-10-09", 3, 3),

        ("Eid ul-Fitr",         "2026-03-20", 3, 2),

        ("New Year",            "2026-01-01", 4, 2),
        ("New Year",            "2027-01-01", 4, 2),


        ("Summer Vacation",     "2026-05-01", 0, 60),
        ("Summer Vacation",     "2027-05-01", 0, 60),


        ("Winter Vacation",     "2026-12-22", 0, 14),
        ("Winter Vacation",     "2027-12-22", 0, 14),
        ("Winter Vacation",     "2028-12-22", 0, 14),
    ]

    for name, date_str, lower, upper in variable:
        rows.append({
            "holiday": name,
            "ds": pd.Timestamp(date_str),
            "lower_window": -lower,
            "upper_window": upper,
        })

    df = pd.DataFrame(rows)
    df["ds"] = pd.to_datetime(df["ds"])
    return df