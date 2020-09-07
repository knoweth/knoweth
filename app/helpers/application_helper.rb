module ApplicationHelper
  def link_to_in_li(body, url, html_options = {})
    active = "active" if current_page?(url)
    content_tag :li, class: [active, "nav-item"] do
      link_to body, url, html_options.merge({ class: "nav-link" })
    end
  end
end
