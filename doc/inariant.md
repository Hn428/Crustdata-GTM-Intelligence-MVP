INVARIANTS

1. mock/direct/agent intelligence modes must continue working.

2. OpenAI is the reasoning layer.
   Crustdata provides factual/current evidence.

3. Fit score remains deterministic.

4. Crustdata/OpenAI credentials never reach the client.

5. Search results are persisted after research.
   Viewing /search/[id] must not rerun external research.

6. Publishing uses persisted research.
   Publishing must not call Crustdata again.

7. Private outbound data and public report data
   have an explicit sanitation boundary.

8. Public reports never expose:
   - outreach angle
   - internal score
   - private notes
   - unnecessary buyer/contact data.

9. Public reports must still render when
   OpenAI/Crustdata are unavailable.

10. Do not introduce major new frameworks
    without a concrete need.
