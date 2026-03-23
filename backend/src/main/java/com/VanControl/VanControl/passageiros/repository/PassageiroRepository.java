package com.VanControl.VanControl.passageiros.repository;

import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PassageiroRepository extends JpaRepository<Passageiro, UUID> {
    Passageiro findByCpf(String cpf);
}
