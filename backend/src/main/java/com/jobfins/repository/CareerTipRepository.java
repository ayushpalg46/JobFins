package com.jobfins.repository;

import com.jobfins.model.CareerTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerTipRepository extends JpaRepository<CareerTip, Long> {

    List<CareerTip> findAllByOrderByCreatedAtDesc();

    List<CareerTip> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
}
