import { Component} from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  toggled = false;

  showSignIn() {
    this.toggled = false;
  }

  showSignUp() {
    this.toggled = true;
}
}
