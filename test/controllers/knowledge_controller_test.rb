require 'test_helper'

class KnowledgeControllerTest < ActionDispatch::IntegrationTest
  test "successfully upserts new knowledge" do
    put("/knowledge/upsert", params: { knowledges: [{
      card_id: "bob",
      document_id: documents(:one).id,
      ease_factor: 1,
      interval_s: 1,
      learning_step: 0,
      repetitions: 0,
      last_review: Time.now
    }] })
    assert_response :success
  end
end
