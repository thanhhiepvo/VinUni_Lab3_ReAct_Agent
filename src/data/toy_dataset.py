"""
Toy dataset for the Emergency Exam Cramming Agent.
Provides small deterministic summaries and practice items for testing.
"""
DATA = {
    "calculus": {
        "summary": "Limits, derivatives, basic integrals, and fundamental theorems. Key formulas: (d/dx)x^n = n x^{n-1}; \n\n integral of x^n = x^{n+1}/(n+1)",
        "topics": ["limits", "derivatives", "integrals"],
        "practice": [
            {"q": "Compute limit of (sin x)/x as x->0.", "a": "1"},
            {"q": "Differentiate x^3.", "a": "3x^2"},
            {"q": "Integrate 2x.", "a": "x^2 + C"}
        ]
    },
    "algebra": {
        "summary": "Linear equations, factoring, quadratic formula. Key: ax^2+bx+c=0 -> x = (-b +/- sqrt(b^2-4ac))/(2a)",
        "topics": ["equations", "factoring"],
        "practice": [
            {"q": "Solve x+5=12.", "a": "7"},
            {"q": "Factor x^2-5x+6.", "a": "(x-2)(x-3)"}
        ]
    }
}

