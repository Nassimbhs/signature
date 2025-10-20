import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignatureComponent } from './components/signature/signature.component';

const routes: Routes = [
  { path: '', component: SignatureComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
