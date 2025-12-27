"""Secrets management for local development and GCP production.

Local Development:
  - Reads from .env.local (OPENAI_API_KEY)

GCP Production:
  - Reads from GCP Secret Manager (GOOGLE_CLOUD_PROJECT)
"""

import os


def get_openai_api_key() -> str:
    """Get OpenAI API key from environment or GCP Secret Manager.

    Priority:
    1. Environment variable OPENAI_API_KEY (set by .env.local or system)
    2. GCP Secret Manager (if GOOGLE_CLOUD_PROJECT is set and running on GCP)

    Returns:
        str: OpenAI API key

    Raises:
        ValueError: If key not found in any source

    """
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print("[INFO] Using OPENAI_API_KEY from environment (.env.local or system)")
        return api_key

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if project_id:
        try:
            from google.cloud import secretmanager

            client = secretmanager.SecretManagerServiceClient()
            secret_name = (
                f"projects/{project_id}/secrets/openai-api-key/versions/latest"
            )
            response = client.access_secret_version(request={"name": secret_name})
            api_key = response.payload.data.decode("UTF-8").strip()

            print(
                f"[INFO] Using OPENAI_API_KEY from GCP Secret Manager "
                f"(project: {project_id})"
            )
            return api_key
        except Exception as e:
            raise ValueError(
                f"Failed to retrieve OPENAI_API_KEY from GCP Secret Manager. "
                f"Project: {project_id}, Error: {e}"
            )

    raise ValueError(
        "OPENAI_API_KEY not configured. "
        "For local development: set OPENAI_API_KEY in .env.local\n"
        "For GCP production: set GOOGLE_CLOUD_PROJECT "
        "and create secret 'openai-api-key'"
    )
