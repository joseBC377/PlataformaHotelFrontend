import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatResponse {
  transcription?: string;
  response: string;
  toolCall?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // Ajusta esta URL con la IP/dominio de tu backend en AWS o local
  private readonly apiUrl = 'http://localhost:8080/api/chatbot';

  constructor(private http: HttpClient) {}

  enviarAudio(audioBlob: Blob): Observable<ChatResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'consulta.wav');
    return this.http.post<ChatResponse>(`${this.apiUrl}/voice`, formData);
  }

  enviarTexto(mensaje: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/text`, { message: mensaje });
  }
}