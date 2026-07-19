package com.example.Campushub.repository;

import com.example.Campushub.entity.Role;
import com.example.Campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    List<User> findByRoleAndGoogleRefreshTokenIsNotNull(Role role);

    // One-time repair for accounts created before the `enabled` column had
    // real data — a legacy NULL reads back as Java `false`, which would
    // silently lock out every old account the moment login started checking
    // it. Only touches rows that are truly NULL in the database; an account
    // an admin has actually disabled has a real `false`, not NULL, and is
    // left untouched.
    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET enabled = true WHERE enabled IS NULL", nativeQuery = true)
    void fixLegacyNullEnabledFlags();

}