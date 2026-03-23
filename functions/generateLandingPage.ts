import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { description } = await req.json();

        if (!description) {
            return Response.json({ error: "Description is required" }, { status: 400 });
        }

        // 1. Generate text structure and image prompts using LLM
        const prompt = `
        Create a professional landing page content for a business described as: "${description}".
        
        Output a JSON object with the following structure:
        {
            "title": "Internal Page Title",
            "slug": "url-friendly-slug",
            "theme_color": "Hex color code matching the brand",
            "hero_section": {
                "title": "Catchy Hero Title",
                "subtitle": "Compelling Subtitle",
                "cta_text": "Call to Action",
                "cta_link": "#contact",
                "image_prompt": "A detailed prompt for an AI image generator to create a high-quality, photorealistic hero image for this business. 16:9 aspect ratio."
            },
            "content_section": "HTML content for the main section (use <h2>, <p>, <ul>, <li>). Be persuasive.",
            "gallery_image_prompts": ["Prompt for gallery image 1", "Prompt for gallery image 2", "Prompt for gallery image 3"],
            "features_section": [
                {"title": "Feature 1", "description": "Description 1", "icon": "Star"},
                {"title": "Feature 2", "description": "Description 2", "icon": "Check"},
                {"title": "Feature 3", "description": "Description 3", "icon": "Heart"}
            ],
            "lead_form_enabled": true,
            "lead_form_title": "Contact Us",
            "lead_form_fields": ["full_name", "phone", "email"],
            "seo_title": "SEO Title",
            "seo_description": "SEO Description"
        }
        
        Language: Hebrew.
        Tone: Professional and persuasive.
        `;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    theme_color: { type: "string" },
                    hero_section: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            subtitle: { type: "string" },
                            cta_text: { type: "string" },
                            cta_link: { type: "string" },
                            image_prompt: { type: "string" }
                        }
                    },
                    content_section: { type: "string" },
                    gallery_image_prompts: { type: "array", items: { type: "string" } },
                    features_section: { 
                        type: "array", 
                        items: { 
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                icon: { type: "string" }
                            }
                        } 
                    },
                    lead_form_enabled: { type: "boolean" },
                    lead_form_title: { type: "string" },
                    lead_form_fields: { type: "array", items: { type: "string" } },
                    seo_title: { type: "string" },
                    seo_description: { type: "string" }
                }
            }
        });

        // 2. Generate Images in Parallel
        const heroPrompt = llmResponse.hero_section.image_prompt;
        const galleryPrompts = llmResponse.gallery_image_prompts || [];

        const imagePromises = [
            // Hero Image
            base44.integrations.Core.GenerateImage({
                prompt: heroPrompt + ", professional photography, high quality, 4k, realistic, wide angle",
            }).then(res => ({ type: 'hero', url: res.url })).catch(e => ({ type: 'hero', error: e })),
            
            // Gallery Images
            ...galleryPrompts.map((p, i) => 
                base44.integrations.Core.GenerateImage({
                    prompt: p + ", professional photography, high quality, 4k, realistic",
                }).then(res => ({ type: 'gallery', index: i, url: res.url })).catch(e => ({ type: 'gallery', index: i, error: e }))
            )
        ];

        const imageResults = await Promise.all(imagePromises);

        // 3. Construct Final Object
        const finalData = { ...llmResponse };
        
        // Assign Hero Image
        const heroResult = imageResults.find(r => r.type === 'hero');
        if (heroResult && !heroResult.error) {
            finalData.hero_section.image_url = heroResult.url;
        } else {
            // Fallback if generation fails
            finalData.hero_section.image_url = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80"; 
        }
        delete finalData.hero_section.image_prompt;

        // Assign Gallery Images
        finalData.gallery_images = [];
        imageResults.filter(r => r.type === 'gallery').sort((a, b) => a.index - b.index).forEach(r => {
            if (!r.error) {
                finalData.gallery_images.push(r.url);
            }
        });
        delete finalData.gallery_image_prompts;

        return Response.json(finalData);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});