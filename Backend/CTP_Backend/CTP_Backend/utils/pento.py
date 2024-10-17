import json
import requests
import uuid

import json
import re

class LdaPento:
    INSIGHTS_PIPELINE_ID = "03f3ca84-649f-41b8-8370-50284c6e3c4a"

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

    def slanting_pipeline(self,type_prompt: str):
       if type_prompt == "bad_ad":
           slanting = "eres un experto en marketing digital. responde con certeza mi pregunta y sin decir que no puedes predecir exactmante , este anuncio no tuvo exito, quiero saber por que no funsiono dimelo. strengths: improve: score: respeta totalmente este formato "
       elif type_prompt == "not_published":
           slanting = "eres un experto en marketing digital. responde con certeza mi pregunta y sin decir que no puedes predecir exactmante, quiero que me digas si este anuncio que voy a publicar va a tener exito o no, ademas calificalo del 1 al 10. "
       else:
           raise Exception(
               f"Invalid type_prompt: {type_prompt}"
            )
       return slanting

    def insights_pipeline(self, image_path: str, type_prompt: str, image_name: str):
        prompt_slanting = self.slanting_pipeline(type_prompt)

        url = self.upload_image(image_name)
        print("responses")
        print(url)
        response = self.request_presigned_url(
            pipeline_id=self.INSIGHTS_PIPELINE_ID,
            body={"inputs": {"image": image_name, "prompt": prompt_slanting}
        })
        return response["insights"]

