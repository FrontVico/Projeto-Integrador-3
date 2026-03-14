package com.VanControl.VanControl.veiculos.repository;

import com.VanControl.VanControl.veiculos.domain.entity.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VeiculoRepository extends JpaRepository<Veiculo, UUID> {

    Veiculo findByPlaca(String placa);
}
