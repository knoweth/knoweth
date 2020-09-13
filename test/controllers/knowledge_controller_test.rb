require 'test_helper'

class KnowledgeControllerTest < ActionDispatch::IntegrationTest
  test "should get upsert" do
    get review_upsert_url
    assert_response :success
  end

end
