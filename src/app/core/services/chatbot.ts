import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';


export interface ChatResponse {

  transcripcion?: string;

  respuesta: string;

}


@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private readonly apiUrl =
    `${environment.API_BASE_URL}/ai`;


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // ENVIAR AUDIO
  // ==========================================

  enviarAudio(
    audioBlob: Blob
  ): Observable<ChatResponse> {

    const formData =
      new FormData();


    formData.append(
      'audio',
      audioBlob,
      'consulta.webm'
    );


    return this.http.post<ChatResponse>(
      `${this.apiUrl}/voice`,
      formData
    );

  }


  // ==========================================
  // ENVIAR TEXTO
  // ==========================================

  enviarTexto(
    mensaje: string
  ): Observable<ChatResponse> {

    return this.http.post<ChatResponse>(
      `${this.apiUrl}/chat`,
      {
        mensaje: mensaje
      }
    );

  }

}