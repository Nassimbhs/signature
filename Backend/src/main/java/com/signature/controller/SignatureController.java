package com.signature.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.signature.dto.SignatureDto;
import com.signature.model.Signature;
import com.signature.service.SignatureService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(value = "/api/v1/signature")
@RequiredArgsConstructor
public class SignatureController {

    private final SignatureService signatureService;

    @PostMapping(value = "/save")
    public Signature saveSignature(@RequestBody SignatureDto dto) {
        return signatureService.saveSignature(dto.getBase64());
    }

}
