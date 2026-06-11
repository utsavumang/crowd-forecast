import logging
import time

import numpy as np
import pandas as pd
from prophet import Prophet
from pytrends.request import TrendReq

from destinations import DESTINATIONS
from holidays import get_indian_holidays

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_trends(search_terms: list) -> pd.DataFrame:
    try:
        pytrends = TrendReq(hl="en-IN", tz=330, timeout=(10, 25))
        time.sleep(1)
        pytrends.build_payload(
            kw_list=search_terms[:3],
            timeframe="today 5-y",
            geo="IN",
        )
        df = pytrends.interest_over_time()

        if df.empty:
            logger.warning("bad response")
            return synthetic_data()

        term_cols = [c for c in df.columns if c != "isPartial"]
        df["combined"] = df[term_cols].mean(axis=1)
        result = df[["combined"]].reset_index().rename(
            columns={"date": "ds", "combined": "y"}
        )
        result["ds"] = pd.to_datetime(result["ds"])
        return result

    except Exception as e:
        logger.warning(f"trends fetch failed ({e})")
        return synthetic_data()


def synthetic_data() -> pd.DataFrame:
    """
    Fallback if Google Trends is unavailable or rate-limited.
    Follows realistic Indian travel seasonality.
    """
    end_date = pd.Timestamp.now().normalize()
    dates = pd.date_range(start="2019-01-01", end=end_date, freq="W")
    values = []

    for d in dates:
        m = d.month
        if m in [4, 5, 6]:
            base = 75
        elif m in [10, 11]:
            base = 70
        elif m in [12, 1]:
            base = 65
        elif m in [2, 3]:
            base = 55
        elif m in [7, 8, 9]:
            base = 35
        else:
            base = 50

        values.append(float(np.clip(base + np.random.normal(0, 7), 5, 100)))

    return pd.DataFrame({"ds": dates, "y": values})


def build_forecast(destination_id: str, forecast_days: int = 120) -> dict:
    config = DESTINATIONS[destination_id]
    logger.info(f"Building forecast for {destination_id}")

    df = fetch_trends(config["search_terms"])
    holidays = get_indian_holidays()

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        holidays=holidays,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.05,
        holidays_prior_scale=10.0,
        interval_width=0.80,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=forecast_days, freq="D")
    forecast = model.predict(future)

    today = pd.Timestamp.now().normalize()
    future_fc = forecast[forecast["ds"] >= today].copy()

    y95 = forecast["yhat"].quantile(0.95)
    y5 = forecast["yhat"].quantile(0.05)
    value_range = y95 - y5 if y95 != y5 else 1.0

    def normalize(val: float) -> float:
        return float(np.clip((val - y5) / value_range * 9 + 1, 1.0, 10.0))

    def categorize(idx: float) -> str:
        if idx >= 8.5:
            return "very_high"
        if idx >= 6.5:
            return "high"
        if idx >= 4.5:
            return "moderate"
        if idx >= 2.5:
            return "low"
        return "very_low"

    def confidence(row) -> float:
        interval = row["yhat_upper"] - row["yhat_lower"]
        base = max(abs(row["yhat"]), 0.01)
        return round(float(np.clip(1 - interval / (2 * base), 0.50, 0.95)), 2)

    off = config.get("off_months", [])
    results = []

    for _, row in future_fc.iterrows():
        idx = normalize(row["yhat"])
        if row["ds"].month in off:
            idx = max(idx, 8.5)

        results.append({
            "date": row["ds"].strftime("%Y-%m-%d"),
            "crowd_index": round(idx, 1),
            "category": categorize(idx),
            "confidence": confidence(row),
        })

    return {
        "destination_id": destination_id,
        "destination_name": config["name"],
        "state": config["state"],
        "forecast": results,
        "generated_at": pd.Timestamp.now().isoformat(),
    }