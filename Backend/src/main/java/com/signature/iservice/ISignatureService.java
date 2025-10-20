package com.signature.iservice;

import com.signature.model.Signature;

public interface ISignatureService {

    Signature saveSignature(String base64);

}
