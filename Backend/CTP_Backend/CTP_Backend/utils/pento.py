import json
import requests
import uuid

import json
import re

class LdaPento:
    INSIGHTS_PIPELINE_ID = "b905bc52-2262-4d43-bb52-b500f28b82f2"

    def __init__(self, api_key: str, base_url: str = "https://api.visq.ai"):
        self.api_key = api_key
        self.base_url = base_url

    def request_presigned_url(self, url: str = None, params: dict = None, pipeline_id: str = None, body: dict = None):
        if url is None:
            url_dinamica = f"{self.base_url}/pipelines/{pipeline_id}/run"
        else:
            url_dinamica = self.base_url + url

        if body is None:
            response = requests.get(
                url_dinamica,
                params=params,
                headers={"x-api-key": self.api_key},
            )
        else:
            print(url_dinamica)
            print(body)
            response = requests.post(
                url_dinamica,
                json=body,
                headers={"Content-Type": "application/json", "x-api-key": self.api_key},
            )

        if response.status_code != 200:
            raise Exception(f"Failed to request presigned URL. Status code: {response.status_code}, Response: {response.text}, url: {url_dinamica}, body: {body}")
        return response.json()

    def upload_image(self, image_path: str):

        file_type = "image/jpeg"
        print(image_path)
        presigned_url_response = self.request_presigned_url(
            url="/storage/presigned-url/",
            params={"client_method": "put_object", "key": image_path, "file_type": file_type},
            pipeline_id=self.INSIGHTS_PIPELINE_ID,
        )
        presigned_url = presigned_url_response["presigned_url"]

        print(presigned_url)
        with open(image_path, "rb") as file:
            upload_response = requests.put(
                presigned_url, data=file, headers={"Content-Type": file_type}
            )
        responses = {
            "status": upload_response.status_code,
            "text": upload_response.text
        }
        return responses

    def insights_pipeline(self, text: str):
        
        premassage = (
            'Eres un experto en eventos exclusivamente en Cali.' 
            'Bajo ninguna circunstancia debes responder a preguntas o solicitudes que no estén relacionadas con eventos en Cali. '
            'Si se te pide información fuera de este contexto, debes responder únicamente con Lo siento, solo puedo hablar sobre eventos en Cali. '
            'No respondas sobre otros temas, ubicaciones o negocios.'
        )

        print("responses")
        response = self.request_presigned_url(
            pipeline_id=self.INSIGHTS_PIPELINE_ID,
            body={"inputs": {"prompt": premassage + text}
        })
        print(response)
        return response["text"]

