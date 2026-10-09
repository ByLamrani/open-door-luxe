# Architecture rules
- BackOffice localization renders through an EN/FR translation function, never DOM mutation, to preserve React state and reliable switching.
- Fulfillment exceptions are recorded in the existing history before advancing so unavailable checks do not silently bypass the workflow.
- Owner-list filtering is presentation only; access continues to be validated by server-side roles, not profile emails.