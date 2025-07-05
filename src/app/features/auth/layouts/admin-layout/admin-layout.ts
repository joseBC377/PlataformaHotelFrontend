import { Component } from '@angular/core';
// import { Header } from "../../../../shared/components/header/header";
import { Footer } from "../../../../shared/components/footer/footer";
import { RouterOutlet } from '@angular/router';
import { HeaderAd } from "../../../../shared/components/header-ad/header-ad";

@Component({
  selector: 'app-admin-layout',
  imports: [Footer, RouterOutlet, HeaderAd],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {

}
