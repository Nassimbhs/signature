package com.signature.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.signature.model.Signature;

@Repository
public interface ISignatureData extends JpaRepository<Signature, Long> {

}
