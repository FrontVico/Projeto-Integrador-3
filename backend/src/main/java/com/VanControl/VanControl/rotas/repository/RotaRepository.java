package com.VanControl.VanControl.rotas.repository;

import com.VanControl.VanControl.rotas.domain.entity.Rota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RotaRepository extends JpaRepository<Rota, UUID> {
    List<Rota> findByDestinoContainingIgnoreCase(String destino);

    Rota findByDescricao(String descricao);
    Optional<Rota> findByCodigoRota(String codigoRota);

    boolean existsByDescricao(String descricao);

    void deleteByCodigoRota(String codigoRota);
}
