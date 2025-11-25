import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatbotService, Recomendacion } from '../services/chatbot'; // Importamos tu servicio

// Definimos cómo se ve un mensaje interno en la pantalla
interface MensajeChat {
  remitente: 'usuario' | 'bot';
  texto: string;
  doctores?: Recomendacion[]; // Opcional: solo si el bot manda doctores
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule], // Importamos los superpoderes de Ionic y Angular
})
export class Tab1Page {
  
  // Inyectamos el servicio (nueva forma moderna de Angular)
  private chatbotService = inject(ChatbotService);

  // Variables para la vista
  mensajeUsuario: string = '';
  historialChat: MensajeChat[] = [
    { remitente: 'bot', texto: 'Hola, soy tu asistente médico virtual. ¿Qué síntomas tienes hoy?' }
  ];
  cargando: boolean = false;

  constructor() {}

  enviar() {
    if (!this.mensajeUsuario.trim()) return;

    // 1. Guardamos el mensaje del usuario
    const textoEnviado = this.mensajeUsuario;
    this.historialChat.push({ remitente: 'usuario', texto: textoEnviado });
    this.mensajeUsuario = ''; 
    this.cargando = true;

    // 2. Llamamos a la API
    // OJO AQUÍ: cambiamos (respuesta) por (aux: any) para inspeccionar todo
    this.chatbotService.enviarMensaje(textoEnviado).subscribe({
      next: (aux: any) => {
        this.cargando = false;
        
        // --- AQUÍ ESTÁ EL FIX ---
        // La API devuelve { respuesta: { ...datos... } }
        // Así que extraemos los datos reales:
        const datosReales = aux.respuesta; 

        console.log('Datos recibidos del servidor:', datosReales); // Para que lo veas en consola (F12)

        // 3. Agregamos la respuesta del bot al historial
        this.historialChat.push({
          remitente: 'bot',
          texto: datosReales.mensaje_al_usuario, // Ahora sí leemos del lugar correcto
          doctores: datosReales.recomendaciones
        });
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error:', error);
        this.historialChat.push({ remitente: 'bot', texto: 'Error de conexión.' });
      }
    });
  }

  // Función dummy para el botón de agendar (luego tu equipo pondrá la navegación real)
  agendarCita(doctor: Recomendacion) {
    alert(`Redirigiendo para agendar con: ${doctor.nombre}`);
  }
}
