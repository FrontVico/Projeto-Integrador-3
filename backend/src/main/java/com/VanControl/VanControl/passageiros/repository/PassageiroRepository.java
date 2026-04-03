package com.VanControl.VanControl.passageiros.repository;

import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PassageiroRepository extends JpaRepository<Passageiro, UUID> {
    Passageiro findByCpf(String cpf);

    Optional<Passageiro> findByUser_Id(String user);
}
