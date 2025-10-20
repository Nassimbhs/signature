package com.signature.model;

import com.signature.model.framework.ObjetPersistant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Signature extends ObjetPersistant{

    @Column(columnDefinition = "TEXT")
    private String base64;

}
