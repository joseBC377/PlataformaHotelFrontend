import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderAd } from "../../../../shared/components/header-ad/header-ad";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HeaderAd],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {

}
