import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderRecep } from "../../../../shared/components/header-recep/header-recep";

@Component({
  selector: 'app-recep-layout',
  imports: [RouterOutlet, HeaderRecep],
  templateUrl: './recep-layout.html',
  styleUrl: './recep-layout.scss'
})
export class RecepLayout {

}
