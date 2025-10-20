import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

const API_URL = environment.endPoint;

@Injectable({
  providedIn: 'root'
})
export class SignatureService {

  constructor(private http: HttpClient) { }

  uploadSignature = (signatureBase64: string): Observable<any> => {
    const payload = { base64: signatureBase64 };
    return this.http.post(API_URL+'/api/v1/signature/save', payload);
  }

}
