package com.signature.service;

import org.springframework.stereotype.Service;

import com.signature.data.ISignatureData;
import com.signature.iservice.ISignatureService;
import com.signature.model.Signature;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SignatureService implements ISignatureService {

    private final ISignatureData signaturedata;

    @Override
    public Signature saveSignature(String base64) {
        Signature signature = new Signature();
        signature.setBase64(base64);
        return signaturedata.save(signature);
    }

}
