package com.example.Campushub.controller;

import com.example.Campushub.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin("*")
public class UploadController {

    private final CloudinaryService service;

    public UploadController(CloudinaryService service) {
        this.service = service;
    }

    @PostMapping
    public String uploadFile(
            @RequestParam("file")
            MultipartFile file)
            throws IOException {

        return service.uploadFile(file);
    }
}