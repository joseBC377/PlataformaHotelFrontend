import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ChatbotService,
  ChatResponse
} from '../../../core/services/chatbot';


// ==========================================================
// TIPOS
// ==========================================================

interface Message {

  sender:
    | 'user'
    | 'assistant';

  text: string;

  transcription?: string;

  toolCall?: any;
}


interface FormattedLine {

  type:
    | 'text'
    | 'title'
    | 'strong'
    | 'price'
    | 'total'
    | 'status'
    | 'space';

  text: string;
}


// ==========================================================
// COMPONENTE
// ==========================================================

@Component({

  selector: 'app-chatbot',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './chatbot.html',

  styleUrl:
    './chatbot.scss'
})

export class Chatbot
  implements AfterViewChecked {


  // ========================================================
  // CONTENEDOR DEL CHAT
  // ========================================================

  @ViewChild('chatScroll')
  private chatScroll?:
    ElementRef<HTMLDivElement>;


  // ========================================================
  // ESTADO
  // ========================================================

  isOpen = false;

  isRecording = false;

  loading = false;

  inputText = '';


  // ========================================================
  // CONTROL SCROLL
  // ========================================================

  private debeHacerScroll = false;


  // ========================================================
  // MENSAJES
  // ========================================================

  messages: Message[] = [

    {

      sender:
        'assistant',

      text:
        '¡Hola! Bienvenido al Hotel Royal Suites.\n' +
        'Soy tu Royal Concierge. ¿En qué puedo ayudarte?'

    }

  ];


  // ========================================================
  // AUDIO
  // ========================================================

  private mediaRecorder:
    MediaRecorder | null = null;

  private audioChunks:
    Blob[] = [];

  private audioStream:
    MediaStream | null = null;


  // ========================================================
  // CONSTRUCTOR
  // ========================================================

  constructor(

    private chatbotService:
      ChatbotService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ========================================================
  // AFTER VIEW
  // ========================================================

  ngAfterViewChecked():
    void {

    if (
      this.debeHacerScroll
    ) {

      this.debeHacerScroll =
        false;

      this.scrollToBottom();

    }

  }


  // ========================================================
  // ABRIR / CERRAR
  // ========================================================

  toggleChat():
    void {

    this.isOpen =
      !this.isOpen;

    this.actualizarVista();

  }


  // ========================================================
  // ACTUALIZAR VISTA
  // ========================================================

  private actualizarVista():
    void {

    this.debeHacerScroll =
      true;

    this.cdr.detectChanges();

    setTimeout(
      () => {

        this.scrollToBottom();

      },
      0
    );

  }


  // ========================================================
  // SCROLL
  // ========================================================

  private scrollToBottom():
    void {

    try {

      const container =
        this.chatScroll
          ?.nativeElement;

      if (!container) {

        return;

      }

      container.scrollTo({

        top:
          container.scrollHeight,

        behavior:
          'smooth'

      });

    } catch (error) {

      console.error(
        '[CHAT] Error realizando scroll:',
        error
      );

    }

  }


  // ========================================================
  // FORMATEAR RESPUESTA DE LA IA
  // ========================================================

  formatMessage(
    text: string
  ): FormattedLine[] {

    if (!text) {

      return [];

    }


    // ------------------------------------------------------
    // Normalizar
    // ------------------------------------------------------

    let contenido =
      text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');


    // ------------------------------------------------------
    // Separar algunos bloques aunque el modelo
    // los haya enviado en una misma línea.
    // ------------------------------------------------------

    contenido =
      contenido
        .replace(
          /\s+(?=🏨|✨|🛎️|🧖|✈️|🍽️|🚗|📅|🌙|💰|💳|🔖|🟡|🟢|🔴)/g,
          '\n'
        );


    const lines =
      contenido
        .split('\n');


    const resultado:
      FormattedLine[] = [];


    for (
      let rawLine of lines
    ) {

      let line =
        rawLine.trim();


      // ----------------------------------------------------
      // ESPACIO
      // ----------------------------------------------------

      if (!line) {

        resultado.push({

          type:
            'space',

          text:
            ''

        });

        continue;

      }


      // ----------------------------------------------------
      // ELIMINAR MARKDOWN ** **
      // ----------------------------------------------------

      const teniaNegrita =
        /\*\*.+?\*\*/.test(
          line
        );


      line =
        line.replace(
          /\*\*(.*?)\*\*/g,
          '$1'
        );


      // ----------------------------------------------------
      // TOTAL
      // ----------------------------------------------------

      if (
        /^(💳\s*)?total\b/i.test(
          line
        ) ||
        /total de la estad[ií]a/i.test(
          line
        )
      ) {

        resultado.push({

          type:
            'total',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // ESTADO
      // ----------------------------------------------------

      if (
        /pendiente/i.test(
          line
        ) ||
        /confirmad[oa]/i.test(
          line
        ) ||
        /cancelad[oa]/i.test(
          line
        )
      ) {

        resultado.push({

          type:
            'status',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // PRECIO
      // ----------------------------------------------------

      if (
        /S\/\s*\d/i.test(
          line
        )
      ) {

        resultado.push({

          type:
            'price',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // TÍTULOS
      // ----------------------------------------------------

      if (
        /^(habitaciones disponibles|servicios disponibles|servicios del hotel|solicitud de reserva registrada|reserva registrada)/i
          .test(line)
      ) {

        resultado.push({

          type:
            'title',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // HABITACIONES
      // ----------------------------------------------------

      if (
        line.startsWith(
          '🏨'
        )
      ) {

        resultado.push({

          type:
            'strong',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // SERVICIOS
      // ----------------------------------------------------

      if (
        line.startsWith(
          '✨'
        ) ||
        line.startsWith(
          '🛎️'
        ) ||
        line.startsWith(
          '🧖'
        ) ||
        line.startsWith(
          '✈️'
        )
      ) {

        resultado.push({

          type:
            'strong',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // TEXTO QUE VENÍA EN NEGRITA
      // ----------------------------------------------------

      if (
        teniaNegrita &&
        line.length <= 60
      ) {

        resultado.push({

          type:
            'strong',

          text:
            line

        });

        continue;

      }


      // ----------------------------------------------------
      // TEXTO NORMAL
      // ----------------------------------------------------

      resultado.push({

        type:
          'text',

        text:
          line

      });

    }


    return resultado;

  }


  // ========================================================
  // INICIAR GRABACIÓN
  // ========================================================

  async startRecording():
    Promise<void> {

    if (
      this.loading
    ) {

      return;

    }


    try {

      // ----------------------------------------------------
      // MICRÓFONO
      // ----------------------------------------------------

      this.audioStream =
        await navigator
          .mediaDevices
          .getUserMedia({

            audio:
              true

          });


      this.audioChunks =
        [];


      // ----------------------------------------------------
      // FORMATO
      // ----------------------------------------------------

      let options:
        MediaRecorderOptions = {};


      if (

        MediaRecorder
          .isTypeSupported(
            'audio/webm;codecs=opus'
          )

      ) {

        options = {

          mimeType:
            'audio/webm;codecs=opus'

        };

      }


      // ----------------------------------------------------
      // RECORDER
      // ----------------------------------------------------

      this.mediaRecorder =
        new MediaRecorder(

          this.audioStream,

          options

        );


      // ----------------------------------------------------
      // AUDIO
      // ----------------------------------------------------

      this.mediaRecorder
        .ondataavailable =
        (
          event:
            BlobEvent
        ) => {

          if (
            event.data.size > 0
          ) {

            this.audioChunks.push(
              event.data
            );

          }

        };


      // ----------------------------------------------------
      // FIN
      // ----------------------------------------------------

      this.mediaRecorder
        .onstop =
        () => {

          const mimeType =

            this.mediaRecorder
              ?.mimeType

            ||

            'audio/webm';


          const audioBlob =
            new Blob(

              this.audioChunks,

              {

                type:
                  mimeType

              }

            );


          console.log(

            '[VOICE] Audio generado:',

            audioBlob.size,

            'bytes'

          );


          this.detenerMicrofono();


          this.processAudio(
            audioBlob
          );

        };


      // ----------------------------------------------------
      // INICIAR
      // ----------------------------------------------------

      this.mediaRecorder
        .start();


      this.isRecording =
        true;


      console.log(
        '[VOICE] Grabación iniciada'
      );


      this.actualizarVista();


    } catch (error) {


      console.error(

        '[VOICE] Error micrófono:',

        error

      );


      this.isRecording =
        false;


      this.actualizarVista();


      alert(

        'No se pudo acceder al micrófono. ' +
        'Verifica los permisos del navegador.'

      );

    }

  }


  // ========================================================
  // DETENER GRABACIÓN
  // ========================================================

  stopRecording():
    void {

    if (

      !this.mediaRecorder

      ||

      this.mediaRecorder
        .state ===
        'inactive'

    ) {

      return;

    }


    this.mediaRecorder
      .stop();


    this.isRecording =
      false;


    this.loading =
      true;


    console.log(
      '[VOICE] Grabación detenida'
    );


    this.actualizarVista();

  }


  // ========================================================
  // APAGAR MICRÓFONO
  // ========================================================

  private detenerMicrofono():
    void {

    if (
      !this.audioStream
    ) {

      return;

    }


    this.audioStream
      .getTracks()
      .forEach(

        track =>
          track.stop()

      );


    this.audioStream =
      null;

  }


  // ========================================================
  // PROCESAR AUDIO
  // ========================================================

  processAudio(
    blob: Blob
  ): void {

    if (
      blob.size === 0
    ) {

      console.error(
        '[VOICE] Audio vacío.'
      );


      this.loading =
        false;


      this.messages = [

        ...this.messages,

        {

          sender:
            'assistant',

          text:
            'No pude detectar audio. Intenta nuevamente.'

        }

      ];


      this.actualizarVista();

      return;

    }


    this.loading =
      true;


    this.actualizarVista();


    console.log(

      '[VOICE] Enviando audio:',

      blob.size,

      'bytes'

    );


    this.chatbotService
      .enviarAudio(
        blob
      )
      .subscribe({

        // --------------------------------------------------
        // OK
        // --------------------------------------------------

        next:
          (
            res:
              ChatResponse
          ) => {


            console.log(

              '[VOICE] Respuesta backend:',

              res

            );


            // ----------------------------------------------
            // TRANSCRIPCIÓN
            // ----------------------------------------------

            this.messages = [

              ...this.messages,

              {

                sender:
                  'user',

                text:
                  res.transcripcion
                  ||
                  'Mensaje de voz',

                transcription:
                  res.transcripcion

              }

            ];


            // ----------------------------------------------
            // RESPUESTA
            // ----------------------------------------------

            this.messages = [

              ...this.messages,

              {

                sender:
                  'assistant',

                text:
                  res.respuesta

              }

            ];


            this.loading =
              false;


            this.actualizarVista();

          },


        // --------------------------------------------------
        // ERROR
        // --------------------------------------------------

        error:
          (
            error
          ) => {


            console.error(

              '[VOICE] Error:',

              error

            );


            this.loading =
              false;


            this.messages = [

              ...this.messages,

              {

                sender:
                  'assistant',

                text:
                  'No pude procesar el audio. Inténtalo nuevamente.'

              }

            ];


            this.actualizarVista();

          }

      });

  }


  // ========================================================
  // ENVIAR TEXTO
  // ========================================================

  sendMessage():
    void {

    const mensaje =
      this.inputText
        .trim();


    if (

      !mensaje

      ||

      this.loading

    ) {

      return;

    }


    // ------------------------------------------------------
    // MENSAJE USUARIO
    // ------------------------------------------------------

    this.messages = [

      ...this.messages,

      {

        sender:
          'user',

        text:
          mensaje

      }

    ];


    this.inputText =
      '';


    this.loading =
      true;


    this.actualizarVista();


    console.log(

      '[CHAT] Usuario:',

      mensaje

    );


    // ------------------------------------------------------
    // BACKEND
    // ------------------------------------------------------

    this.chatbotService
      .enviarTexto(
        mensaje
      )
      .subscribe({

        // --------------------------------------------------
        // OK
        // --------------------------------------------------

        next:
          (
            res:
              ChatResponse
          ) => {


            console.log(

              '[CHAT] Respuesta:',

              res

            );


            this.messages = [

              ...this.messages,

              {

                sender:
                  'assistant',

                text:
                  res.respuesta

              }

            ];


            this.loading =
              false;


            this.actualizarVista();

          },


        // --------------------------------------------------
        // ERROR
        // --------------------------------------------------

        error:
          (
            error
          ) => {


            console.error(

              '[CHAT] Error:',

              error

            );


            this.loading =
              false;


            this.messages = [

              ...this.messages,

              {

                sender:
                  'assistant',

                text:
                  'No pude procesar tu mensaje. Inténtalo nuevamente.'

              }

            ];


            this.actualizarVista();

          }

      });

  }

}