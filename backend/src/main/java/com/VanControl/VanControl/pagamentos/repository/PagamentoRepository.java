package com.VanControl.VanControl.pagamentos.repository;

import com.VanControl.VanControl.pagamentos.domain.entity.Pagamento;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.*;
import java.util.List;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

   List<Pagamento> findByPassageiroId(UUID passageiroId);

   List<Pagamento> id(UUID id);

   boolean existsByPassageiroIdAndCompetencia(UUID passageiroId, String competencia);
}
