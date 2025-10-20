package com.signature.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignatureDto {

    private Long id;
    private String base64;
    
}
