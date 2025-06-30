import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./shared/components/header/header";
import { Footer } from "./shared/components/footer/footer";
import { Inicio } from "./pages/inicio/inicio";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Inicio],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'PlataformaHotelFrontend';
}
