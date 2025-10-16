import numpy as np

def detect_anomalies(durations):
    """
    Detect anomalies in trip durations using IQR method.
    Returns a list of indices of anomalous durations.
    """
    if not durations:
        return []

    # Calculate Q1, Q3, IQR
    q1 = np.percentile(durations, 25)
    q3 = np.percentile(durations, 75)
    iqr = q3 - q1

    # Define bounds
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    # Find anomalies
    anomalies = [i for i, d in enumerate(durations) if d < lower_bound or d > upper_bound]

    return anomalies
