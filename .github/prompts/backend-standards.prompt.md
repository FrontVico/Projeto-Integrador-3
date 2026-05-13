# Backend Agent Prompt (VanControl) - Prescriptive

You are assisting on the backend of VanControl (Spring Boot, Java 21). Follow the existing architecture and conventions strictly. Prefer small, consistent changes that match current patterns.

## Project context and references
- Backend root: [backend](backend)
- Controllers and endpoints: [backend/src/main/java/com/VanControl/VanControl/rotas/controller/RotaController.java](backend/src/main/java/com/VanControl/VanControl/rotas/controller/RotaController.java)
- Services: [backend/src/main/java/com/VanControl/VanControl/rotas/service/RotaService.java](backend/src/main/java/com/VanControl/VanControl/rotas/service/RotaService.java)
- DTO patterns: [backend/src/main/java/com/VanControl/VanControl/rotas/domain/dto](backend/src/main/java/com/VanControl/VanControl/rotas/domain/dto)
- Entities and JPA: [backend/src/main/java/com/VanControl/VanControl/rotas/domain/entity/Rota.java](backend/src/main/java/com/VanControl/VanControl/rotas/domain/entity/Rota.java)
- Repositories: [backend/src/main/java/com/VanControl/VanControl/rotas/repository/RotaRepository.java](backend/src/main/java/com/VanControl/VanControl/rotas/repository/RotaRepository.java)
- Security helpers: [backend/src/main/java/com/VanControl/VanControl/commons/util/SecurityUtils.java](backend/src/main/java/com/VanControl/VanControl/commons/util/SecurityUtils.java)
- Global errors: [backend/src/main/java/com/VanControl/VanControl/commons/exception/GlobalExceptionHandler.java](backend/src/main/java/com/VanControl/VanControl/commons/exception/GlobalExceptionHandler.java)

## Non-negotiable rules
- Follow the package base com.VanControl.VanControl and domain folder layout. Do not create new top-level packages.
- Do not access repositories from controllers. All persistence goes through services.
- Do not return entities directly from controllers. Always return DTOs.
- Do not introduce new error handling styles. Use exceptions from commons.exception.model so GlobalExceptionHandler formats responses.
- Do not add new dependencies or architectural patterns without explicit request.

## Architecture and naming
- Domain structure must be: <domain>/controller, <domain>/service, <domain>/repository, <domain>/domain/entity, <domain>/domain/dto/request, <domain>/domain/dto/response, <domain>/mapper.
- DTOs are Java records. Request DTOs must include jakarta.validation annotations.
- Use Lombok in entities and services: @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor. Use @Builder only when needed.
- Use descriptive method names in Portuguese or existing domain language (match current domain).

## Controller rules
- Every endpoint must have: @Operation with summary and description, and @Tag at class level.
- Security: use @SecurityRequirement at class level and @PreAuthorize at method level when roles apply.
- Input validation: annotate request bodies with @Valid and use request DTOs.
- Response: use ResponseEntity with explicit status codes (do not rely on default).

## Service rules
- Service methods encapsulate all business logic, validation, and permission checks.
- Use repository query methods; if needed, add a new repository query in the same change.
- Use @Transactional for delete and any multi-step update.
- On conflicts or not found, throw ConflictException or NotFoundException with domain-consistent messages.

## Entity and persistence rules
- Use UUID @Id with @GeneratedValue(strategy = GenerationType.UUID).
- Use @Column(unique = true) for unique fields (cpf, email, codigoRota, etc.).
- Keep entity fields and DTO fields aligned in name and type.
- For time fields, use @JsonFormat(pattern = "HH:mm") in DTOs and entity.

## Security and role gates
- Roles used: ADMIN, MOTORISTA, PASSAGEIRO (ROLE_ prefix is implicit in Spring Security).
- Use @PreAuthorize("hasAnyRole(...)") for role gates.
- For CPF-specific access, call SecurityUtils.validateCpfAccess before business logic.

## Change checklist (must satisfy)
- Controller endpoint added or changed? Add or update service method and DTOs.
- Service method added or changed? Add or update mapper and repository queries as needed.
- Request DTO updated? Ensure @Valid and constraints align with business rules.
- New error condition? Use custom exception from commons.exception.model.
- New time field? Use @JsonFormat(pattern = "HH:mm").

## Output expectations
- Keep changes minimal and consistent with existing patterns.
- If you add an endpoint, include controller, service, DTOs, mapper, and repository changes in one batch.
- Do not introduce alternative styles or refactors unless explicitly requested.
